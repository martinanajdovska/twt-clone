import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like as TypeOrmLike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, Role } from '../entities/user.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async register(
    username: string,
    email: string,
    password: string,
    role: Role,
  ): Promise<User> {
    if (!username?.trim() || !password?.trim()) {
      throw new BadRequestException('Must fill both username and password');
    }

    if (await this.existsByUsername(username)) {
      throw new ConflictException(`Username ${username} already exists`);
    }

    if (await this.existsByEmail(email)) {
      throw new ConflictException(`Email ${email} already exists`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({
      username,
      email,
      password: hashedPassword,
      firebaseUid: null,
      role,
    });

    return this.userRepo.save(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { username } });
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { firebaseUid } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findOrCreateFromFirebase(
    firebaseUid: string,
    email: string,
    preferredUsername?: string,
  ): Promise<User> {
    let user = await this.findByFirebaseUid(firebaseUid);
    if (user) return user;

    user = await this.userRepo.findOne({ where: { email } });
    if (user) {
      user.firebaseUid = firebaseUid;
      return this.userRepo.save(user);
    }

    let username = preferredUsername?.trim();
    if (!username) {
      username =
        email
          .replace(/@.*$/, '')
          .replace(/[^a-zA-Z0-9_]/g, '_')
          .toLowerCase() || 'user';
    }

    let base = username;
    let suffix = 0;

    while (await this.existsByUsername(username)) {
      username = `${base}${++suffix}`;
    }

    const newUser = this.userRepo.create({
      username,
      email,
      password: null,
      firebaseUid,
      role: Role.USER,
    });
    return this.userRepo.save(newUser);
  }

  async existsByUsername(username: string): Promise<boolean> {
    return (await this.userRepo.count({ where: { username } })) > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    return (await this.userRepo.count({ where: { email } })) > 0;
  }

  async findByUsernameContaining(search: string): Promise<string[]> {
    const users = await this.userRepo
      .createQueryBuilder('u')
      .select('u.username')
      .where('u.username ILIKE :pattern', { pattern: `${search}%` })
      .orderBy('u.username')
      .limit(5)
      .getMany();
    return users.map((u) => u.username);
  }

  async updateProfileImage(
    username: string,
    file: Express.Multer.File,
  ): Promise<void> {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('User not found');

    const imageUrl = file
      ? await this.cloudinaryService.uploadFile(file, 'profile_pictures')
      : null;
    user.imageUrl = imageUrl;
    await this.userRepo.save(user);
  }

  async updateProfile(
    username: string,
    updates: {
      bio?: string | null;
      location?: string | null;
      website?: string | null;
      birthday?: string | null;
      displayName?: string | null;
    },
    bannerFile?: Express.Multer.File,
  ): Promise<void> {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('User not found');

    if (updates.bio !== undefined) {
      if (updates.bio != null && updates.bio.length > 160)
        throw new BadRequestException('Bio must be at most 160 characters');
      user.bio = updates.bio ?? null;
    }

    if (updates.location !== undefined) {
      if (updates.location != null && updates.location.length > 100)
        throw new BadRequestException(
          'Location must be at most 100 characters',
        );
      user.location = updates.location ?? null;
    }

    if (updates.website !== undefined) {
      if (updates.website != null && updates.website.length > 100)
        throw new BadRequestException('Website must be at most 100 characters');
      user.website = updates.website ?? null;
    }

    if (updates.birthday !== undefined) {
      if (updates.birthday && updates.birthday !== '') {
        const birthDate = new Date(updates.birthday);
        birthDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (birthDate > today) {
          throw new BadRequestException('Birth date cannot be in the future');
        }
      }
      user.birthday = updates.birthday !== '' ? updates.birthday : null;
    }

    if (updates.displayName !== undefined) {
      if (updates.displayName != null && updates.displayName.length > 50)
        throw new BadRequestException(
          'Display name must be at most 50 characters',
        );
      user.displayName = updates.displayName ?? null;
    }

    if (bannerFile) {
      user.bannerUrl = await this.cloudinaryService.uploadFile(
        bannerFile,
        'profile_banners',
      );
    }
    await this.userRepo.save(user);
  }

  async getUsernameAndProfilePicture(username: string): Promise<{
    username: string;
    profilePicture: string | null;
  }> {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('User not found');

    return {
      username: user.username,
      profilePicture: user.imageUrl ?? null,
    };
  }
}

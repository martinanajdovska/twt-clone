import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like as TypeOrmLike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, Role } from '../entities/user.entity';
import { FollowsService } from '../follows/follows.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

export interface UserInfoDto {
  username: string;
  displayName: string | null;
  followers: number;
  following: number;
  isFollowed: boolean;
  isFollowingYou: boolean;
  imageUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  birthday: string | null;
  createdAt: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @Inject(forwardRef(() => FollowsService))
    private readonly followsService: FollowsService,
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
  ): Promise<{ imageUrl: string | null }> {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('User not found');

    if (!file) throw new BadRequestException('No file uploaded');

    const imageUrl = await this.cloudinaryService.uploadFile(
      file,
      'profile_pictures',
    );

    user.imageUrl = imageUrl;
    await this.userRepo.save(user);
    return { imageUrl };
  }

  async updateProfile(
    username: string,
    bio?: string,
    location?: string,
    website?: string,
    birthday?: string,
    displayName?: string,
    bannerFile?: Express.Multer.File,
  ): Promise<{
    displayName?: string;
    bio?: string;
    location?: string;
    website?: string;
    birthday?: string;
    bannerUrl?: string;
    createdAt: string;
  }> {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('User not found');

    if (bio) {
      if (bio.length > 160)
        throw new BadRequestException('Bio must be at most 160 characters');
    }
    user.bio = bio ?? null;

    if (location) {
      if (location.length > 100)
        throw new BadRequestException(
          'Location must be at most 100 characters',
        );
    }
    user.location = location ?? null;

    if (website) {
      if (website.length > 100)
        throw new BadRequestException('Website must be at most 100 characters');
    }
    user.website = website ?? null;

    if (birthday) {
      const birthDate = new Date(birthday);
      birthDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (birthDate > today) {
        throw new BadRequestException('Birth date cannot be in the future');
      }
    }
    user.birthday = birthday && birthday !== '' ? birthday : null;

    if (displayName) {
      if (displayName.length > 50)
        throw new BadRequestException(
          'Display name must be at most 50 characters',
        );
    }
    user.displayName = displayName ?? null;

    if (bannerFile) {
      user.bannerUrl = await this.cloudinaryService.uploadFile(
        bannerFile,
        'profile_banners',
      );
    }

    const saved = await this.userRepo.save(user);
    const createdAt =
      saved.createdAt instanceof Date
        ? saved.createdAt.toISOString()
        : String(saved.createdAt ?? new Date());

    return {
      displayName: saved.displayName ?? undefined,
      bio: saved.bio ?? undefined,
      location: saved.location ?? undefined,
      website: saved.website ?? undefined,
      birthday: saved.birthday ?? undefined,
      bannerUrl: saved.bannerUrl ?? undefined,
      createdAt,
    };
  }

  async saveExpoPushToken(username: string, token: string): Promise<void> {
    if (!token) return;

    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('User not found');

    user.expoPushToken = token;
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

  async getUserInfo(username: string, requester: string): Promise<UserInfoDto> {
    const user = await this.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');

    const createdAt =
      user.createdAt instanceof Date
        ? user.createdAt.toISOString()
        : String(user.createdAt ?? new Date());

    const [followers, following, isFollowed, isFollowingYou] =
      await Promise.all([
        this.followsService.getFollowerCount(username),
        this.followsService.getFollowingCount(username),
        this.followsService.existsFollowed(requester, username),
        this.followsService.existsFollowingYou(username, requester),
      ]);

    return {
      username: user.username,
      displayName: user.displayName ?? null,
      followers,
      following,
      isFollowed,
      isFollowingYou,
      imageUrl: user.imageUrl ?? null,
      bannerUrl: user.bannerUrl ?? null,
      bio: user.bio ?? null,
      location: user.location ?? null,
      website: user.website ?? null,
      birthday: user.birthday ?? null,
      createdAt,
    };
  }
}

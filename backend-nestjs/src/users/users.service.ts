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
    private userRepo: Repository<User>,
    private cloudinaryService: CloudinaryService,
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
      role,
    });
    return this.userRepo.save(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
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

  async updateProfileImage(username: string, file: Express.Multer.File): Promise<void> {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('User not found');
    const imageUrl = file
      ? await this.cloudinaryService.uploadFile(file, 'profile_pictures')
      : null;
    user.imageUrl = imageUrl;
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

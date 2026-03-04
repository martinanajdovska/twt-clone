import { Injectable, OnModuleInit } from "@nestjs/common";
import { Role, User } from "src/entities/user.entity";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class GrokBotSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    const existing = await this.userRepo.findOne({ where: { username: 'grok' } });
    if (!existing) {
      const grok = this.userRepo.create({
        username: 'grok',
        email: 'grok@internal.bot',
        role: Role.GROK,
        password: await bcrypt.hash(crypto.randomUUID(), 10)
      });
      await this.userRepo.save(grok);
    }
  }
}
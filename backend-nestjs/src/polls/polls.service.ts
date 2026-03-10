import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll } from '../entities/poll.entity';
import { PollOption } from '../entities/poll-option.entity';
import { PollVote } from '../entities/poll-vote.entity';
import { UsersService } from '../users/users.service';
import { PollDto } from './dto/poll.dto';
import { PollOptionDto } from './dto/poll-option.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PollsService {
  constructor(
    @InjectRepository(Poll)
    private pollRepo: Repository<Poll>,
    @InjectRepository(PollOption)
    private pollOptionRepo: Repository<PollOption>,
    @InjectRepository(PollVote)
    private pollVoteRepo: Repository<PollVote>,
    private usersService: UsersService,
  ) {}

  async createPoll(
    tweetId: number,
    options: string[],
    durationHours: number,
  ): Promise<Poll> {
    const endsAt = new Date();
    endsAt.setHours(endsAt.getHours() + durationHours);

    const poll = this.pollRepo.create({
      tweet: { id: tweetId },
      endsAt,
    });
    const saved = await this.pollRepo.save(poll);

    const optionEntities = options.map((label, i) =>
      this.pollOptionRepo.create({
        poll: saved,
        label: label.trim().slice(0, 25),
        orderIndex: i,
      }),
    );
    await this.pollOptionRepo.save(optionEntities);

    return saved;
  }

  async getPollDto(pollId: number, currentUsername: string): Promise<PollDto> {
    const poll = await this.pollRepo.findOne({
      where: { id: pollId },
    });
    if (!poll) throw new NotFoundException('Poll not found');

    const options = await this.pollOptionRepo.find({
      where: { poll: { id: pollId } },
      order: { orderIndex: 'ASC' },
    });
    const optionIds = options.map((o) => o.id);

    const user = await this.usersService.findByUsername(currentUsername);
    if (!user) throw new NotFoundException('User not found');

    let selectedOptionId: number | null = null;

    const voteCounts = await this.pollVoteRepo
      .createQueryBuilder('v')
      .select('v.poll_option_id', 'optionId')
      .addSelect('COUNT(*)', 'count')
      .where('v.poll_option_id IN (:...optionIds)', { optionIds })
      .groupBy('v.poll_option_id')
      .getRawMany<{ optionId: number; count: string }>();

    const countMap = new Map<number, number>();
    for (const row of voteCounts) {
      countMap.set(row.optionId, parseInt(row.count, 10));
    }

    const userVote = await this.pollVoteRepo.findOne({
      where: { poll: { id: pollId }, user: { id: user.id } },
      relations: ['pollOption'],
    });
    if (userVote) selectedOptionId = userVote.pollOption.id;

    const optionsDto: PollOptionDto[] = options.map((o) => ({
      id: o.id,
      label: o.label,
      votes: countMap.get(o.id) ?? 0,
    }));

    return {
      id: poll.id,
      endsAt: poll.endsAt.toISOString(),
      options: optionsDto,
      selectedOptionId,
      isClosed: poll.isClosed,
    };
  }

  async vote(
    tweetId: number,
    optionId: number,
    username: string,
  ): Promise<PollDto> {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');

    const poll = await this.pollRepo.findOne({
      where: { tweet: { id: tweetId } },
    });
    if (!poll) throw new NotFoundException('Poll not found');
    if (new Date() >= poll.endsAt) {
      throw new BadRequestException('Poll has ended');
    }

    const options = await this.pollOptionRepo.find({
      where: { poll: { id: poll.id } },
    });
    const option = options.find((o) => o.id === optionId);
    if (!option) throw new BadRequestException('Invalid poll option');

    const existing = await this.pollVoteRepo.findOne({
      where: { poll: { id: poll.id }, user: { id: user.id } },
    });
    if (existing) throw new BadRequestException('You have already voted');

    await this.pollVoteRepo.save(
      this.pollVoteRepo.create({
        poll,
        user,
        pollOption: option,
      }),
    );

    const dto = await this.getPollDto(poll.id, username);
    return dto;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async closeExpiredPolls(): Promise<void> {
    await this.pollRepo
      .createQueryBuilder()
      .update()
      .set({ isClosed: true })
      .where('ends_at <= :now', { now: new Date() })
      .andWhere('is_closed = false')
      .execute();
  }
}

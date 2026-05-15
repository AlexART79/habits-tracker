import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Habit } from '@prisma/client';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';

@Injectable()
export class HabitsService {
  constructor(private readonly prisma: PrismaService) {}

  private async findOwnedOrThrow(id: string, userId: string): Promise<Habit> {
    const habit = await this.prisma.habit.findUnique({ where: { id } });
    if (!habit) throw new NotFoundException('Habit not found');
    if (habit.userId !== userId) throw new ForbiddenException('Access denied');
    return habit;
  }

  findAllByUser(userId: string): Promise<Habit[]> {
    return this.prisma.habit.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  findOne(id: string, userId: string): Promise<Habit> {
    return this.findOwnedOrThrow(id, userId);
  }

  create(userId: string, dto: CreateHabitDto): Promise<Habit> {
    return this.prisma.habit.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        startDate: new Date(dto.startDate),
        status: 'ACTIVE',
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateHabitDto): Promise<Habit> {
    const existing = await this.findOwnedOrThrow(id, userId);
    if (existing.status === 'ARCHIVED') {
      throw new BadRequestException('Archived habits cannot be edited');
    }
    return this.prisma.habit.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOwnedOrThrow(id, userId);
    await this.prisma.habit.delete({ where: { id } });
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await service.$disconnect();
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('is an instance of PrismaService', () => {
    expect(service).toBeInstanceOf(PrismaService);
  });

  it('has a $connect method', () => {
    expect(typeof service.$connect).toBe('function');
  });

  it('has a $disconnect method', () => {
    expect(typeof service.$disconnect).toBe('function');
  });
});

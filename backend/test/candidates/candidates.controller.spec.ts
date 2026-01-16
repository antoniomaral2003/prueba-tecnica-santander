import { Test, TestingModule } from '@nestjs/testing';
import { CandidatesController } from '../../src/candidates/candidates.controller';
import { CandidatesService } from '../../src/candidates/candidates.service';
import { CreateCandidateDto } from '../../src/candidates/dto/create-candidate.dto';
import { UpdateCandidateDto } from '../../src/candidates/dto/update-candidate.dto';
import { CandidateResponseDto } from '../../src/candidates/dto/candidate-response.dto';
import { Candidate } from '../../src/candidates/entities/candidate.entity';

describe('CandidatesController', () => {
    let controller: CandidatesController;
    let service: CandidatesService;

    const mockCandidate: Candidate = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John',
        surname: 'Doe',
        seniority: 'junior',
        years: 3,
        availability: true,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
    };

    const mockCandidateResponseDto: CandidateResponseDto = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John',
        surname: 'Doe',
        seniority: 'junior',
        years: 3,
        availability: true,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
    };

    const mockCreateCandidateDto: CreateCandidateDto = {
        name: 'John',
        surname: 'Doe',
        seniority: 'junior',
        years: 3,
        availability: true,
    };

    const mockCandidatesService = {
        create: jest.fn().mockResolvedValue(mockCandidate),
        findAll: jest.fn().mockResolvedValue([mockCandidate]),
        findOne: jest.fn().mockResolvedValue(mockCandidate),
        update: jest.fn().mockResolvedValue(mockCandidate),
        remove: jest.fn().mockResolvedValue(undefined),
        processExcel: jest.fn().mockResolvedValue([mockCandidate]),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CandidatesController],
            providers: [
                {
                    provide: CandidatesService,
                    useValue: mockCandidatesService,
                },
            ],
        }).compile();

        controller = module.get<CandidatesController>(CandidatesController);
        service = module.get<CandidatesService>(CandidatesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a candidate and return response DTO', async () => {
            const result = await controller.create(mockCreateCandidateDto);

            expect(service.create).toHaveBeenCalledWith(mockCreateCandidateDto);
            expect(result).toBeInstanceOf(CandidateResponseDto);
            expect(result.id).toBe(mockCandidateResponseDto.id);
            expect(result.name).toBe(mockCandidateResponseDto.name);
        });
    });

    describe('uploadExcel', () => {
        it('should process uploaded Excel file', async () => {
            const mockFile = {
                fieldname: 'file',
                originalname: 'test.xlsx',
                encoding: '7bit',
                mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                buffer: Buffer.from('test'),
                size: 1024,
            } as Express.Multer.File;

            const result = await controller.uploadExcel(mockFile);

            expect(service.processExcel).toHaveBeenCalledWith(mockFile);
            expect(result).toBeInstanceOf(Array);
            expect(result[0]).toBeInstanceOf(CandidateResponseDto);
        });
    });

    describe('findAll', () => {
        it('should return an array of candidate response DTOs', async () => {
            const result = await controller.getAll();

            expect(service.getAll).toHaveBeenCalled();
            expect(result).toBeInstanceOf(Array);
            expect(result[0]).toBeInstanceOf(CandidateResponseDto);
            expect(result).toHaveLength(1);
        });
    });

    describe('findOne', () => {
        it('should return a candidate response DTO by id', async () => {
            const id = '123e4567-e89b-12d3-a456-426614174000';
            const result = await controller.getOne(id);

            expect(service.getOne).toHaveBeenCalledWith(id);
            expect(result).toBeInstanceOf(CandidateResponseDto);
            expect(result.id).toBe(id);
        });
    });

    describe('update', () => {
        it('should update a candidate and return response DTO', async () => {
            const id = '123e4567-e89b-12d3-a456-426614174000';
            const updateDto: UpdateCandidateDto = {
                name: 'Jane',
                years: 5,
            };

            const result = await controller.update(id, updateDto);

            expect(service.update).toHaveBeenCalledWith(id, updateDto);
            expect(result).toBeInstanceOf(CandidateResponseDto);
        });
    });

    describe('remove', () => {
        it('should remove a candidate', async () => {
            const id = '123e4567-e89b-12d3-a456-426614174000';

            await controller.remove(id);

            expect(service.remove).toHaveBeenCalledWith(id);
            expect(service.remove).toHaveBeenCalledTimes(1);
        });

        it('should return no content', async () => {
            const id = '123e4567-e89b-12d3-a456-426614174000';

            // Como es un método void, solo verificamos que no lance error
            await expect(controller.remove(id)).resolves.not.toThrow();
        });
    });
});
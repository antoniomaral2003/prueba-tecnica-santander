import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CandidatesService } from '../../src/candidates/candidates.service';
import { Candidate } from '../../src/candidates/entities/candidate.entity';
import { FileUploadService } from '../../src/candidates/file-upload.service';
import { CreateCandidateDto } from '../../src/candidates/dto/create-candidate.dto';
import { UpdateCandidateDto } from '../../src/candidates/dto/update-candidate.dto';

describe('CandidatesService', () => {
  let service: CandidatesService;
  let repository: Repository<Candidate>;
  let fileUploadService: FileUploadService;

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

  const mockCreateCandidateDto: CreateCandidateDto = {
    name: 'John',
    surname: 'Doe',
    seniority: 'junior',
    years: 3,
    availability: true,
  };

  const mockRepository = {

    create: jest.fn().mockImplementation((dto) => ({
      ...dto,
      id: '123e4567-e89b-12d3-a456-426614174000',
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    save: jest.fn().mockImplementation((candidate) => Promise.resolve({
      ...candidate,
      id: '123e4567-e89b-12d3-a456-426614174000',
    })),
    find: jest.fn().mockResolvedValue([mockCandidate]),
    findOne: jest.fn().mockResolvedValue(mockCandidate),
    remove: jest.fn().mockResolvedValue(mockCandidate),

  };

  const mockFileUploadService = {
    processExcelFile: jest.fn().mockResolvedValue([mockCreateCandidateDto]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidatesService,
        {
          provide: getRepositoryToken(Candidate),
          useValue: mockRepository,
        },
        {
          provide: FileUploadService,
          useValue: mockFileUploadService,
        },
      ],
    }).compile();

    service = module.get<CandidatesService>(CandidatesService);
    repository = module.get<Repository<Candidate>>(getRepositoryToken(Candidate));
    fileUploadService = module.get<FileUploadService>(FileUploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create a candidate', async () => {
      const result = await service.create(mockCreateCandidateDto);

      expect(repository.create).toHaveBeenCalledWith(mockCreateCandidateDto);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(mockCreateCandidateDto.name);
      expect(result.seniority).toBe(mockCreateCandidateDto.seniority);
    });

    it('should call repository with correct parameters', async () => {
      await service.create(mockCreateCandidateDto);

      expect(repository.create).toHaveBeenCalledWith({
        name: 'John',
        surname: 'Doe',
        seniority: 'junior',
        years: 3,
        availability: true,
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of candidates', async () => {
      const result = await service.getAll();

      expect(result).toEqual([mockCandidate]);
      expect(repository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array when no candidates exist', async () => {
      mockRepository.find.mockResolvedValueOnce([]);

      const result = await service.getAll();

      expect(result).toEqual([]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a candidate when found', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const result = await service.getOne(id);

      expect(result).toEqual(mockCandidate);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id } });
    });

    it('should throw NotFoundException when candidate not found', async () => {
      const id = 'non-existent-id';
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.getOne(id)).rejects.toThrow(NotFoundException);
      await expect(service.getOne(id)).rejects.toThrow(
        `Candidate with ID ${id} not found`,
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateCandidateDto = {
      name: 'Jane',
      years: 5,
    };

    it('should update and return the candidate', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updatedCandidate = { ...mockCandidate, ...updateDto };

      const findOneSpy = jest.spyOn(service, 'getOne').mockResolvedValue(mockCandidate);
      mockRepository.save.mockResolvedValueOnce(updatedCandidate);

      const result = await service.update(id, updateDto);

      expect(findOneSpy).toHaveBeenCalledWith(id);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockCandidate,
        ...updateDto,
      });
      expect(result).toEqual(updatedCandidate);
    });

    it('should throw NotFoundException when trying to update non-existent candidate', async () => {
      const id = 'non-existent-id';
      jest.spyOn(service, 'getOne').mockRejectedValueOnce(
        new NotFoundException(`Candidate with ID ${id} not found`),
      );

      await expect(service.update(id, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove the candidate successfully', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const findOneSpy = jest.spyOn(service, 'getOne').mockResolvedValue(mockCandidate);

      await service.remove(id);

      expect(findOneSpy).toHaveBeenCalledWith(id);
      expect(mockRepository.remove).toHaveBeenCalledWith(mockCandidate);
    });

    it('should throw NotFoundException when trying to remove non-existent candidate', async () => {
      const id = 'non-existent-id';
      jest.spyOn(service, 'getOne').mockRejectedValueOnce(
        new NotFoundException(`Candidate with ID ${id} not found`),
      );

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('processExcel', () => {
    it('should process Excel file and create candidates', async () => {
      const mockFile = {
        buffer: Buffer.from('mock excel content'),
      } as Express.Multer.File;

      const result = await service.processExcel(mockFile);

      expect(fileUploadService.processExcelFile).toHaveBeenCalledWith(mockFile);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple candidates', async () => {
      const candidatesData: CreateCandidateDto[] = [
        mockCreateCandidateDto,
        { ...mockCreateCandidateDto, name: 'Jane' },
      ];

      const result = await service.bulkCreate(candidatesData);

      expect(mockRepository.create).toHaveBeenCalledTimes(2);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(2);
    });
  });
});
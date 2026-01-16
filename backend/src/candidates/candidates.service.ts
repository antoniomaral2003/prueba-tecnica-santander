import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from './entities/candidate.entity';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { FileUploadService } from './file-upload.service';

@Injectable()
export class CandidatesService {

    constructor(@InjectRepository(Candidate) private candidateRepository: Repository<Candidate>, private fileUploadService: FileUploadService) {}

    async getAll(): Promise<Candidate[]> {

        return await this.candidateRepository.find({
            order: { createdAt: 'DESC' }
        });

    }

    async create(createCandidateDto: CreateCandidateDto): Promise<Candidate> {

        const candidate = this.candidateRepository.create(createCandidateDto);
        return await this.candidateRepository.save(candidate);

    }

    async getOne(id: string): Promise<Candidate> {

        const candidate =await this.candidateRepository.findOne({ where: { id } });
        if (!candidate) {
            throw new NotFoundException(`Candidate with ID ${id} not found`)
        }

        return candidate;

    }

    async update(id: string, updateCandidateDto: UpdateCandidateDto): Promise<Candidate> {

        const candidate = await this.getOne(id);
        Object.assign(candidate, updateCandidateDto);

        return await this.candidateRepository.save(candidate);

    }

    async remove(id: string): Promise<void> {

        const candidate = await this.getOne(id);
        await this.candidateRepository.remove(candidate);

    }

    async processExcel(file: Express.Multer.File): Promise<Candidate[]> {

        const candidatesData = await this.fileUploadService.processExcelFile(file);
        const candidates: Candidate[] = [];

        for (const candidateData of candidatesData) {

            const candidate = this.candidateRepository.create(candidateData);
            const savedCandidate = await this.candidateRepository.save(candidate);
            candidates.push(savedCandidate);

        }

        return candidates;

    }

    async bulkCreate(candidatesData: CreateCandidateDto[]): Promise<Candidate[]> {

        const candidates = candidatesData.map(data =>
            this.candidateRepository.create(data)
        );
        return await this.candidateRepository.save(candidates);

    }

}
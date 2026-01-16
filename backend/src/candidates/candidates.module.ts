import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { Candidate } from './entities/candidate.entity';
import { FileUploadService } from './file-upload.service';

@Module({
    imports: [TypeOrmModule.forFeature([Candidate])],
    controllers: [CandidatesController],
    providers: [CandidatesService, FileUploadService],
    exports: [CandidatesService],
})
export class CandidatesModule {}
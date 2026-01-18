import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    ClassSerializerInterceptor,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { Candidate } from './entities/candidate.entity';
import { CandidateResponseDto } from './dto/candidate-response.dto';
import { CreateCandidateWithExcelDto } from './dto/create-candidate-excel.dto';
import { plainToInstance } from 'class-transformer';
import { FileUploadService } from './file-upload.service';

@Controller('candidates')
@UseInterceptors(ClassSerializerInterceptor)
export class CandidatesController {

    constructor(private candidateService: CandidatesService,
         private fileUploadService: FileUploadService) {}

    @Get()
    async getAll(): Promise<CandidateResponseDto[]> {

        const candidates = await this.candidateService.getAll();
        return plainToInstance(CandidateResponseDto, candidates);

    }

    @Get(':id')
    async getOne(@Param('id') id: string): Promise<CandidateResponseDto> {

        const candidate = await this.candidateService.getOne(id);
        return plainToInstance(CandidateResponseDto, candidate);

    }

    @Post()
    async create(@Body() createCandidateDto: CreateCandidateDto): Promise<CandidateResponseDto> {

        const candidate = await this.candidateService.create(createCandidateDto);
        return plainToInstance(CandidateResponseDto, candidate);

    }

    @Post('create-excel')
    @UseInterceptors(FileInterceptor('excelFile'))
    async createWithExcel(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
                    new FileTypeValidator({
                        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet|application/vnd.ms-excel'
                    }),
                ],
            }),
        )
        excelFile: Express.Multer.File,
        @Body() formData: CreateCandidateWithExcelDto
    ): Promise<CandidateResponseDto> {

        const candidateData = await this.fileUploadService.processExcelFile(
            excelFile,
            formData.name,
            formData.surname
        );

        const candidate = await this.candidateService.create(candidateData);
        return plainToInstance(CandidateResponseDto, candidate);

    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateCandidateDto: UpdateCandidateDto): Promise<CandidateResponseDto> {

        const candidate = await this.candidateService.update(id, updateCandidateDto);
        return plainToInstance(CandidateResponseDto, candidate);

    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string): Promise<void> {

        await this.candidateService.remove(id);

    }

}
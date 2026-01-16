import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { CreateCandidateDto } from './dto/create-candidate.dto';

@Injectable()
export class FileUploadService {

    async processExcelFile(file: Express.Multer.File): Promise<CreateCandidateDto[]> {

        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const data = XLSX.utils.sheet_to_json(worksheet);

        return data.map((row: any) => ({
            name: row.name || row.nombre || row.Name || '',
            surname: row.surname || row.apellido || row.Surname || '',
            seniority: this.normalizeSeniority(row.seniority || row.Seniority || ''),
            years: parseInt(row.years || row.años || row.Years || 0, 10),
            availability: this.parseBoolean(row.availability || row.disponibilidad || row.Availability || true),
        }));

    }

    private normalizeSeniority(seniority: string): string {

        const normalized = seniority.toLowerCase().trim();
        const validSeniorities = ['junior', 'senior'];

        if (validSeniorities.includes(normalized)) {
            return normalized;
        }

        const mappings: Record<string, string> = {
            'jr': 'junior',
            'júnior': 'junior',
            'jun': 'junior',
            'sr': 'senior',
            'sénior': 'senior',
            'sen': 'senior',
        };

        return mappings[normalized] || 'junior';

    }

    private parseBoolean(value: any): boolean {

        if (typeof value === 'boolean') return value;

        if (typeof value === 'string') {
            const lower = value.toLowerCase();
            return lower === 'true' || lower === 'yes' || lower === 'si' || lower === 'sí' || lower === '1';
        }

        if (typeof value === 'number') return value > 0;

        return false;

    }

}
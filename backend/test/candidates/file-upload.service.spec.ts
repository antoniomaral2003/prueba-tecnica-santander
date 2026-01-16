import { Test, TestingModule } from '@nestjs/testing';
import * as XLSX from 'xlsx';
import { FileUploadService } from '../../src/candidates/file-upload.service';

jest.mock('xlsx', () => ({
    read: jest.fn(),
    utils: {
        sheet_to_json: jest.fn(),
    },
}));

describe('FileUploadService', () => {
    let service: FileUploadService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [FileUploadService],
        }).compile();

        service = module.get<FileUploadService>(FileUploadService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('processExcelFile', () => {
        it('should process Excel file correctly', async () => {
            const mockFile = {
                buffer: Buffer.from('test'),
            } as Express.Multer.File;

            const mockWorkbook = {
                SheetNames: ['Sheet1'],
                Sheets: {
                    Sheet1: {},
                },
            };

            const mockData = [
                {
                    name: 'John',
                    surname: 'Doe',
                    seniority: 'junior',
                    years: '3',
                    availability: 'true',
                },
            ];

            (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
            (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

            const result = await service.processExcelFile(mockFile);

            expect(XLSX.read).toHaveBeenCalledWith(mockFile.buffer, { type: 'buffer' });
            expect(XLSX.utils.sheet_to_json).toHaveBeenCalledWith(mockWorkbook.Sheets.Sheet1);
            expect(result).toEqual([
                {
                    name: 'John',
                    surname: 'Doe',
                    seniority: 'junior',
                    years: 3,
                    availability: true,
                },
            ]);
        });

        it('should handle different column names', async () => {
            const mockFile = {
                buffer: Buffer.from('test'),
            } as Express.Multer.File;

            const mockWorkbook = {
                SheetNames: ['Sheet1'],
                Sheets: { Sheet1: {} },
            };

            const mockData = [
                {
                    nombre: 'John',
                    apellido: 'Doe',
                    seniority: 'mid',
                    años: '5',
                    disponibilidad: 'si',
                },
            ];

            (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
            (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockData);

            const result = await service.processExcelFile(mockFile);

            expect(result).toEqual([
                {
                    name: 'John',
                    surname: 'Doe',
                    seniority: 'mid',
                    years: 5,
                    availability: true,
                },
            ]);
        });

        it('should handle empty file', async () => {
            const mockFile = {
                buffer: Buffer.from('test'),
            } as Express.Multer.File;

            const mockWorkbook = {
                SheetNames: ['Sheet1'],
                Sheets: { Sheet1: {} },
            };

            (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
            (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([]);

            const result = await service.processExcelFile(mockFile);

            expect(result).toEqual([]);
        });
    });

    describe('normalizeSeniority', () => {
        it('should normalize valid seniority levels', () => {
            expect(service['normalizeSeniority']('junior')).toBe('junior');
            expect(service['normalizeSeniority']('JUNIOR')).toBe('junior');
            expect(service['normalizeSeniority']('Junior')).toBe('junior');
            expect(service['normalizeSeniority']('  junior  ')).toBe('junior');
            expect(service['normalizeSeniority']('senior')).toBe('senior');
        });

        it('should map common synonyms', () => {
            expect(service['normalizeSeniority']('jr')).toBe('junior');
            expect(service['normalizeSeniority']('júnior')).toBe('junior');
            expect(service['normalizeSeniority']('sr')).toBe('senior');
            expect(service['normalizeSeniority']('sénior')).toBe('senior');
        });

        it('should default to junior for unknown values', () => {
            expect(service['normalizeSeniority']('unknown')).toBe('junior');
            expect(service['normalizeSeniority']('')).toBe('junior');
        });
    });

    describe('parseBoolean', () => {
        it('should parse boolean values correctly', () => {
            expect(service['parseBoolean'](true)).toBe(true);
            expect(service['parseBoolean'](false)).toBe(false);
        });

        it('should parse string values correctly', () => {
            expect(service['parseBoolean']('true')).toBe(true);
            expect(service['parseBoolean']('TRUE')).toBe(true);
            expect(service['parseBoolean']('yes')).toBe(true);
            expect(service['parseBoolean']('YES')).toBe(true);
            expect(service['parseBoolean']('si')).toBe(true);
            expect(service['parseBoolean']('SI')).toBe(true);
            expect(service['parseBoolean']('sí')).toBe(true);
            expect(service['parseBoolean']('SÍ')).toBe(true);
            expect(service['parseBoolean']('1')).toBe(true);
            expect(service['parseBoolean']('false')).toBe(false);
            expect(service['parseBoolean']('no')).toBe(false);
            expect(service['parseBoolean']('0')).toBe(false);
        });

        it('should parse number values correctly', () => {
            expect(service['parseBoolean'](1)).toBe(true);
            expect(service['parseBoolean'](0)).toBe(false);
            expect(service['parseBoolean'](10)).toBe(true);
        });

        it('should default to false for unknown values', () => {
            expect(service['parseBoolean'](null)).toBe(false);
            expect(service['parseBoolean'](undefined)).toBe(false);
            expect(service['parseBoolean']({})).toBe(false);
            expect(service['parseBoolean']([])).toBe(false);
        });
    });
});

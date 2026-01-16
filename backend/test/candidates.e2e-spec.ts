import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Candidate } from '../src/candidates/entities/candidate.entity';

describe('CandidatesController (e2e)', () => {
    let app: INestApplication;
    let repository: Repository<Candidate>;

    const mockCandidate = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John',
        surname: 'Doe',
        seniority: 'junior',
        years: 3,
        availability: true,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(getRepositoryToken(Candidate))
            .useValue({
                create: jest.fn().mockReturnValue(mockCandidate),
                save: jest.fn().mockResolvedValue(mockCandidate),
                find: jest.fn().mockResolvedValue([mockCandidate]),
                findOne: jest.fn().mockResolvedValue(mockCandidate),
                remove: jest.fn().mockResolvedValue(mockCandidate),
            })
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();

        repository = moduleFixture.get<Repository<Candidate>>(getRepositoryToken(Candidate));
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/candidates (POST)', () => {
        it('should create a new candidate', () => {
            const createDto = {
                name: 'John',
                surname: 'Doe',
                seniority: 'junior',
                years: 3,
                availability: true,
            };

            return request(app.getHttpServer())
                .post('/candidates')
                .send(createDto)
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id');
                    expect(res.body.name).toBe(createDto.name);
                    expect(res.body.seniority).toBe(createDto.seniority);
                    expect(res.body.availability).toBe(createDto.availability);
                });
        });

        it('should return 400 for invalid data', () => {
            const invalidDto = {
                name: '', // Invalid: empty name
                surname: 'Doe',
                seniority: 'invalid', // Invalid seniority
                years: -1, // Invalid: negative years
                availability: 'yes', // Should be boolean
            };

            return request(app.getHttpServer())
                .post('/candidates')
                .send(invalidDto)
                .expect(400);
        });
    });

    describe('/candidates (GET)', () => {
        it('should return an array of candidates', () => {
            return request(app.getHttpServer())
                .get('/candidates')
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                    expect(res.body.length).toBeGreaterThan(0);
                    expect(res.body[0]).toHaveProperty('id');
                    expect(res.body[0]).toHaveProperty('name');
                });
        });
    });

    describe('/candidates/:id (GET)', () => {
        it('should return a single candidate', () => {
            const id = '123e4567-e89b-12d3-a456-426614174000';

            return request(app.getHttpServer())
                .get(`/candidates/${id}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.id).toBe(id);
                    expect(res.body).toHaveProperty('name');
                    expect(res.body).toHaveProperty('seniority');
                });
        });

        it('should return 404 for non-existent candidate', () => {
            const nonExistentId = '00000000-0000-0000-0000-000000000000';
            jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

            return request(app.getHttpServer())
                .get(`/candidates/${nonExistentId}`)
                .expect(404);
        });
    });

    describe('/candidates/:id (PATCH)', () => {
        it('should update a candidate', () => {
            const id = '123e4567-e89b-12d3-a456-426614174000';
            const updateDto = {
                name: 'Jane',
                years: 5,
            };

            return request(app.getHttpServer())
                .patch(`/candidates/${id}`)
                .send(updateDto)
                .expect(200)
                .expect((res) => {
                    expect(res.body.id).toBe(id);
                    expect(res.body.name).toBe(updateDto.name);
                });
        });
    });

    describe('/candidates/:id (DELETE)', () => {
        it('should delete a candidate', () => {
            const id = '123e4567-e89b-12d3-a456-426614174000';

            return request(app.getHttpServer())
                .delete(`/candidates/${id}`)
                .expect(204);
        });
    });

    describe('/candidates/upload (POST)', () => {
        it('should handle file upload', () => {
            // Crear un mock de archivo Excel
            const mockExcelBuffer = Buffer.from([
                0x50, 0x4B, 0x03, 0x04, // Cabecera de archivo ZIP (para .xlsx)
                // ... resto del contenido mock
            ]);

            return request(app.getHttpServer())
                .post('/candidates/upload')
                .attach('file', mockExcelBuffer, 'test.xlsx')
                .expect(201)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                });
        });

        it('should return 400 for non-Excel files', () => {
            const textBuffer = Buffer.from('This is a text file, not Excel');

            return request(app.getHttpServer())
                .post('/candidates/upload')
                .attach('file', textBuffer, 'test.txt')
                .expect(400);
        });
    });
});
import { validate } from 'class-validator';
import { CreateCandidateDto } from '../../../src/candidates/dto/create-candidate.dto';

describe('CreateCandidateDto', () => {
    let createCandidateDto: CreateCandidateDto;

    beforeEach(() => {
        createCandidateDto = new CreateCandidateDto();
    });

    describe('validation', () => {
        it('should pass validation with valid data', async () => {
            createCandidateDto.name = 'John';
            createCandidateDto.surname = 'Doe';
            createCandidateDto.seniority = 'junior';
            createCandidateDto.years = 3;
            createCandidateDto.availability = true;

            const errors = await validate(createCandidateDto);
            expect(errors).toHaveLength(0);
        });

        it('should fail validation with empty name', async () => {
            createCandidateDto.name = '';
            createCandidateDto.surname = 'Doe';
            createCandidateDto.seniority = 'junior';
            createCandidateDto.years = 3;
            createCandidateDto.availability = true;

            const errors = await validate(createCandidateDto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('name');
            expect(errors[0].constraints).toHaveProperty('isString');
        });

        it('should fail validation with invalid seniority', async () => {
            createCandidateDto.name = 'John';
            createCandidateDto.surname = 'Doe';
            createCandidateDto.seniority = 'invalid-seniority';
            createCandidateDto.years = 3;
            createCandidateDto.availability = true;

            const errors = await validate(createCandidateDto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('seniority');
            expect(errors[0].constraints).toHaveProperty('isIn');
        });

        it('should fail validation with negative years', async () => {
            createCandidateDto.name = 'John';
            createCandidateDto.surname = 'Doe';
            createCandidateDto.seniority = 'junior';
            createCandidateDto.years = -1;
            createCandidateDto.availability = true;

            const errors = await validate(createCandidateDto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('years');
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail validation with years above maximum', async () => {
            createCandidateDto.name = 'John';
            createCandidateDto.surname = 'Doe';
            createCandidateDto.seniority = 'junior';
            createCandidateDto.years = 60;
            createCandidateDto.availability = true;

            const errors = await validate(createCandidateDto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('years');
            expect(errors[0].constraints).toHaveProperty('max');
        });

        it('should fail validation with non-integer years', async () => {
            createCandidateDto.name = 'John';
            createCandidateDto.surname = 'Doe';
            createCandidateDto.seniority = 'junior';
            createCandidateDto.years = 3.5;
            createCandidateDto.availability = true;

            const errors = await validate(createCandidateDto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('years');
            expect(errors[0].constraints).toHaveProperty('isInt');
        });

        it('should accept all valid seniority levels', async () => {
            const validSeniorities = ['junior', 'senior'];

            for (const seniority of validSeniorities) {
                createCandidateDto.name = 'John';
                createCandidateDto.surname = 'Doe';
                createCandidateDto.seniority = seniority;
                createCandidateDto.years = 3;
                createCandidateDto.availability = true;

                const errors = await validate(createCandidateDto);
                expect(errors).toHaveLength(0);
            }
        });
    });

    describe('types', () => {
        it('should accept boolean for availability', async () => {
            createCandidateDto.name = 'John';
            createCandidateDto.surname = 'Doe';
            createCandidateDto.seniority = 'junior';
            createCandidateDto.years = 3;
            createCandidateDto.availability = false;

            const errors = await validate(createCandidateDto);
            expect(errors).toHaveLength(0);
        });

        it('should fail with string for years', async () => {
            // @ts-ignore: Testing invalid type
            createCandidateDto.years = '3';
            createCandidateDto.name = 'John';
            createCandidateDto.surname = 'Doe';
            createCandidateDto.seniority = 'junior';
            createCandidateDto.availability = true;

            const errors = await validate(createCandidateDto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('years');
        });
    });
});
import { IsString, IsIn, IsInt, IsBoolean, Min, Max } from 'class-validator';

export class CreateCandidateDto {

    @IsString()
    name: string;

    @IsString()
    surname: string;

    @IsString()
    @IsIn(['junior', 'senior'])
    seniority: string;

    @IsInt()
    @Min(0)
    @Max(50)
    years: number;

    @IsBoolean()
    availability: boolean;

}
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CandidateResponseDto {

    @Expose()
    id: string;

    @Expose()
    name: string;

    @Expose()
    surname: string;

    @Expose()
    seniority: string;

    @Expose()
    years: number;

    @Expose()
    availability: boolean;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;

}
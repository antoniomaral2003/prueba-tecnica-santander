import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCandidateWithExcelDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    surname: string;

}
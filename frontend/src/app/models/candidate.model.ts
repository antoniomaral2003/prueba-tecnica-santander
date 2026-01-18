export interface Candidate {

  id?: string;
  name: string;
  surname: string;
  seniority: 'junior' | 'senior';
  years: number;
  availability: boolean;
  createdAt?: Date;
  updatedAt?: Date;

}

export interface ExcelData {

  seniority: string;
  years: string;
  availability: string;

}

export interface CreateCandidateExcelDto {

  name: string;
  surname: string;

}

export interface CreateCandidateDto {

  name: string;
  surname: string;
  seniority: 'junior' | 'senior';
  years: number;
  availability: boolean;

}

export interface UpdateCandidateDto extends Partial<CreateCandidateDto> {}

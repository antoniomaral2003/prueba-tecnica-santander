import { Injectable, inject } from '@angular/core';
import * as XLSX from 'xlsx';
import { SnackbarService } from './snackbar.service';

@Injectable({
  providedIn: 'root',
})
export class ExcelService {

  private snackbarService = inject(SnackbarService);

  async readExcel(file: File): Promise<any> {

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (!jsonData || jsonData.length === 0) {
            throw new Error('El archivo Excel está vacío');
          }

          // Tomar solo la primera fila
          const firstRow = jsonData[0] as any;

          // Parsear los datos de la fila
          const excelData = {
            seniority: this.normalizeSeniority(firstRow.seniority || firstRow.Seniority || ''),
            years: this.normalizeYears(firstRow.years || firstRow.Years || firstRow['years_experience'] || ''),
            availability: this.normalizeAvailability(firstRow.availability || firstRow.Availability || '')
          };

          resolve(excelData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });

  }

  validateExcelFile(file: File): boolean {

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const maxSize = 5 * 1024 * 1024;

    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(extension)) {
      this.snackbarService.error('Formato de archivo no válido. Use .xlsx, .xls o .csv');
      return false;
    }

    if (file.size > maxSize) {
      this.snackbarService.error('El archivo es demasiado grande. Máximo 5MB');
      return false;
    }

    return true;

  }

  private normalizeSeniority(seniority: string): string {

    const normalized = seniority.toString().toLowerCase().trim();

    const seniorityMap: Record<string, string> = {
      'junior': 'junior',
      'jr': 'junior',
      'júnior': 'junior',
      'senior': 'senior',
      'sr': 'senior',
      'sénior': 'senior',
    };

    return seniorityMap[normalized] || 'junior';

  }

  private normalizeYears(years: any): string {

    const yearsNum = Number(years);
    if (isNaN(yearsNum) || yearsNum < 0) {
      return '0';
    }
    return Math.round(yearsNum).toString();
    
  }

  private normalizeAvailability(availability: any): string {

    if (typeof availability === 'boolean') {
      return availability ? 'true' : 'false';
    }

    const normalized = availability.toString().toLowerCase().trim();
    const trueValues = ['true', 'yes', 'si', 'sí', '1', 'verdadero', 'disponible'];
    const falseValues = ['false', 'no', '0', 'falso', 'no disponible'];

    if (trueValues.includes(normalized)) return 'true';
    if (falseValues.includes(normalized)) return 'false';

    return 'false';

  }

}

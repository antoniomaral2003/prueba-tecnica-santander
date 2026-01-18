
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Candidate, CreateCandidateExcelDto, UpdateCandidateDto } from '../models/candidate.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {

  constructor() {
    this.loadCandidates();
  }

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private candidatesSubject = new BehaviorSubject<Candidate[]>([]);
  candidates$ = this.candidatesSubject.asObservable();

  private selectedCandidateSubject = new BehaviorSubject<Candidate | null>(null);
  selectedCandidate$ = this.selectedCandidateSubject.asObservable();

  private loadCandidates(): void {
    this.getAll().subscribe();
  }

  getAll(): Observable<Candidate[]> {

    return this.http.get<Candidate[]>(this.apiUrl).pipe(
      tap(candidates => this.candidatesSubject.next(candidates)),
      catchError(this.handleError)
    );

  }

  getById(id: string): Observable<Candidate> {

    return this.http.get<Candidate>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );

  }

  createWithExcel(candidateDto: CreateCandidateExcelDto, excelFile: File): Observable<Candidate> {

    const formData = new FormData();
    formData.append('name', candidateDto.name);
    formData.append('surname', candidateDto.surname);
    formData.append('file', excelFile);

    return this.http.post<Candidate>(`${this.apiUrl}/create-excel`, formData).pipe(
      tap(newCandidate => {
        const currentCandidates = this.candidatesSubject.value;
        this.candidatesSubject.next([newCandidate, ...currentCandidates]);
        this.selectCandidate(newCandidate);
      }),
      catchError(this.handleError)
    );

  }

  update(id: string, candidate: UpdateCandidateDto): Observable<Candidate> {

    return this.http.patch<Candidate>(`${this.apiUrl}/${id}`, candidate).pipe(
      tap(updatedCandidate => {
        const currentCandidates = this.candidatesSubject.value;
        const updatedCandidates = currentCandidates.map(c =>
          c.id === id ? updatedCandidate : c
        );
        this.candidatesSubject.next(updatedCandidates);
        this.selectCandidate(updatedCandidate);
      }),
      catchError(this.handleError)
    );

  }

  delete(id: string): Observable<void> {

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const currentCandidates = this.candidatesSubject.value;
        const updatedCandidates = currentCandidates.filter(c => c.id !== id);
        this.candidatesSubject.next(updatedCandidates);
        this.clearSelection();
      }),
      catchError(this.handleError)
    );

  }

  selectCandidate(candidate: Candidate): void {
    this.selectedCandidateSubject.next(candidate);
  }

  clearSelection(): void {
    this.selectedCandidateSubject.next(null);
  }

  private handleError(error: any): Observable<never> {

    console.error('API Error:', error);
    let errorMessage = 'An error occurred';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'Cannot connect to server';
    } else if (error.status === 404) {
      errorMessage = 'Resource not found';
    }

    return throwError(() => new Error(errorMessage));

  }

}

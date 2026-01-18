import { Component, OnInit, OnDestroy, inject, ViewChild, AfterViewInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

// Services & Models
import { CandidateService } from '../../services/candidate.service';
import { SnackbarService } from '../../services/snackbar.service';
import { Candidate } from '../../models/candidate.model';

// Components
import { CandidateDetailComponent } from '../candidate-detail/candidate-detail.component';

@Component({
  selector: 'app-candidates-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './candidates-table.component.html',
  styleUrls: ['./candidates-table.component.scss'],
})
export class CandidatesTableComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private candidateService = inject(CandidateService);
  private snackbarService = inject(SnackbarService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  private readonly destroy$ = new Subject<void>();

  displayedColumns: string[] = ['name', 'surname', 'seniority', 'years', 'availability', 'actions'];
  dataSource = new MatTableDataSource<Candidate>([]);
  isLoading = signal(true);
  isDeleting = signal(false);
  searchValue = signal('');

  totalCandidates = computed(() => this.dataSource.data.length);
  hasNoCandidates = computed(() => !this.isLoading() && this.totalCandidates() === 0);
  hasNoResults = computed(() => !this.isLoading() && this.totalCandidates() > 0 && this.dataSource.filteredData.length === 0);

  ngOnInit(): void {
    this.setupFilterPredicate();
    this.loadCandidates();
    this.subscribeToCandidates();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.sortingDataAccessor = (item: Candidate, property: string) => {
      switch (property) {
        case 'name': return item.name?.toLowerCase() || '';
        case 'surname': return item.surname?.toLowerCase() || '';
        case 'seniority': return item.seniority?.toLowerCase() || '';
        case 'years': return item.years || 0;
        case 'availability': return item.availability ? 1 : 0;
        default: return '';
      }
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilterPredicate(): void {

    this.dataSource.filterPredicate = (data: Candidate, filter: string) => {
      const searchStr = filter.toLowerCase().trim();
      const fullName = `${data.name} ${data.surname}`.toLowerCase();
      const seniority = data.seniority?.toLowerCase() || '';
      const availability = data.availability ? 'disponible' : 'no disponible';

      return fullName.includes(searchStr) ||
        seniority.includes(searchStr) ||
        availability.includes(searchStr) ||
        data.years?.toString().includes(searchStr);
    };

  }

  private subscribeToCandidates(): void {

    this.candidateService.candidates$
      .pipe(takeUntil(this.destroy$))
      .subscribe(candidates => {
        this.dataSource.data = candidates;
        this.isLoading.set(false);
      });

  }

  loadCandidates(): void {

    this.isLoading.set(true);

    this.candidateService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
        error: (error) => {
          this.snackbarService.error(`Error al cargar candidatos: ${error.message}`);
          this.isLoading.set(false);
        }
      });

  }

  navigateToNewCandidate(): void {
    this.router.navigate(['/candidates/new']);
  }

  navigateToEditCandidate(event: Event, candidate: Candidate): void {
    event.stopPropagation();
    if (candidate.id) {
      this.router.navigate(['/candidates/edit', candidate.id]);
    }
  }

  selectCandidate(candidate: Candidate): void {
    this.candidateService.selectCandidate(candidate);
    this.openDetailDialog(candidate);
  }

  openDetailDialog(candidate: Candidate): void {

    this.dialog.open(CandidateDetailComponent, {
      width: '500px',
      data: candidate,
      autoFocus: false
    });

  }

  deleteCandidate(event: Event, candidate: Candidate): void {

    event.stopPropagation();

    if (!candidate.id) return;

    if (confirm('¿Está seguro de eliminar este candidato?')) {
      this.candidateService.delete(candidate.id).subscribe({
        next: () => {
          this.snackbarService.success('Candidato eliminado exitosamente');
        },
        error: (error) => {
          this.snackbarService.error(`Error al eliminar candidato: ${error.message}`);
        }
      });
    }

  }

  getSeniorityBadgeClass(seniority: string): string {

    switch (seniority.toLowerCase()) {
      case 'junior':
        return 'badge-junior';
      case 'senior':
        return 'badge-senior';
      default:
        return 'badge-default';
    }

  }

  getSeniorityLabel(seniority: string): string {

    switch (seniority.toLowerCase()) {
      case 'junior':
        return 'Junior';
      case 'senior':
        return 'Senior';
      default:
        return seniority;
    }

  }

  refreshTable(): void {
    this.loadCandidates();
  }

  getAvailabilityClass(availability: boolean): string {
    return availability ? 'chip-available' : 'chip-unavailable';
  }

  getAvailabilityLabel(availability: boolean): string {
    return availability ? 'Disponible' : 'No disponible';
  }

  getAvailabilityIcon(availability: boolean): string {
    return availability ? 'check_circle' : 'cancel';
  }

  trackByCandidate(index: number, candidate: Candidate): string | number {
    return candidate.id || index;
  }

}

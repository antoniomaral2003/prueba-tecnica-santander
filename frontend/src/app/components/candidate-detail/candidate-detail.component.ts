import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Candidate } from '../../models/candidate.model';

@Component({
  selector: 'app-candidate-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './candidate-detail.component.html',
  styleUrls: ['./candidate-detail.component.scss'],
})
export class CandidateDetailComponent{

  private dialogRef = inject(MatDialogRef<CandidateDetailComponent>);
  private router = inject(Router);
  candidate = inject<Candidate>(MAT_DIALOG_DATA);

  // Seniority helpers
  getSeniorityLabel(seniority: string): string {
    const labels: Record<string, string> = {
      'junior': 'Junior',
      'senior': 'Senior',
    };
    return labels[seniority?.toLowerCase()] || seniority || 'N/A';
  }

  getSeniorityClass(seniority: string): string {
    const classes: Record<string, string> = {
      'junior': 'chip-junior',
      'senior': 'chip-senior',
    };
    return classes[seniority?.toLowerCase()] || 'chip-default';
  }

  getSeniorityIcon(seniority: string): string {
    const icons: Record<string, string> = {
      'junior': 'school',
      'senior': 'military_tech',
    };
    return icons[seniority?.toLowerCase()] || 'star';
  }

  // Availability helpers
  getAvailabilityLabel(availability: boolean): string {
    return availability ? 'Disponible' : 'No disponible';
  }

  getAvailabilityClass(availability: boolean): string {
    return availability ? 'chip-available' : 'chip-unavailable';
  }

  getAvailabilityIcon(availability: boolean): string {
    return availability ? 'check_circle' : 'cancel';
  }

  // Get initials for avatar
  getInitials(): string {
    const first = this.candidate.name?.charAt(0) || '';
    const last = this.candidate.surname?.charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  }

  // Actions
  editCandidate(): void {
    this.dialogRef.close();
    if (this.candidate.id) {
      this.router.navigate(['/candidates/edit', this.candidate.id]);
    }
  }

  close(): void {
    this.dialogRef.close();
  }

}

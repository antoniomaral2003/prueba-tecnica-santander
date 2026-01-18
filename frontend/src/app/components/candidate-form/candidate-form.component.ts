import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';

// Services & Models
import { CandidateService } from '../../services/candidate.service';
import { ExcelService } from '../../services/excel.service';
import { SnackbarService } from '../../services/snackbar.service';
import { Candidate, CreateCandidateExcelDto, ExcelData, UpdateCandidateDto } from '../../models/candidate.model';

@Component({
  selector: 'app-candidate-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDividerModule
  ],
  templateUrl: './candidate-form.component.html',
  styleUrls: ['./candidate-form.component.scss'],
})
export class CandidateFormComponent implements OnInit, OnDestroy {

  @ViewChild('fileInput') fileInput!: ElementRef;

  private readonly fb = inject(FormBuilder);
  private readonly candidateService = inject(CandidateService);
  private readonly excelService = inject(ExcelService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly destroy$ = new Subject<void>();

  candidateForm!: FormGroup;
  editForm!: FormGroup;
  isLoading = signal(false);
  isSubmitting = signal(false);
  isEditMode = signal(false);
  candidateId = signal<string | null>(null);
  fileName = signal('');
  excelData = signal<ExcelData | null>(null);
  excelFile: File | null = null;

  readonly seniorityOptions = [
    { value: 'junior', label: 'Junior' },
    { value: 'senior', label: 'Senior' }
  ];

  pageTitle = computed(() => this.isEditMode() ? 'Editar Candidato' : 'Nuevo Candidato');

  pageSubtitle = computed(() => this.isEditMode()
    ? 'Modifique los datos del candidato'
    : 'Complete el formulario y suba el archivo Excel con los datos adicionales'
  );

  submitButtonText = computed(() => {

    if (this.isSubmitting()) {
      return this.isEditMode() ? 'Guardando...' : 'Creando...';
    }
    return this.isEditMode() ? 'Guardar Cambios' : 'Crear Candidato';

  });

  ngOnInit(): void {
    this.initForms();
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForms(): void {

    // Form for creation mode
    this.candidateForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      surname: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]]
    });

    // Form for edit mode
    this.editForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ]],
      surname: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ]],
      seniority: ['', Validators.required],
      years: [0, [Validators.required, Validators.min(0), Validators.max(50)]],
      availability: [true]
    });

  }

  private checkEditMode(): void {

    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.isEditMode.set(true);
          this.candidateId.set(params['id']);
          this.loadCandidateForEdit();
        }
      });

  }

  private loadCandidateForEdit(): void {

    const id = this.candidateId();
    if (!id) return;

    this.isLoading.set(true);

    this.candidateService.getById(id).pipe(takeUntil(this.destroy$)).subscribe({
        next: (candidate) => {
          this.editForm.patchValue({
            name: candidate.name,
            surname: candidate.surname,
            seniority: candidate.seniority,
            years: candidate.years,
            availability: candidate.availability
          });
          this.isLoading.set(false);
        },
        error: (error) => {
          this.snackbarService.error(`Error al cargar candidato: ${error.message}`);
          this.isLoading.set(false);
          this.router.navigate(['/candidates']);
        }
      });

  }

  onFileSelected(event: Event): void {

    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    // Validate file
    if (!this.excelService.validateExcelFile(file)) {
      this.resetFileInput();
      return;
    }

    this.isLoading.set(true);
    this.fileName.set(file.name);
    this.excelFile = file;

    this.excelService.readExcel(file)
      .then((data: ExcelData) => {
        this.excelData.set(data);
        this.snackbarService.success('Archivo Excel procesado correctamente');
      })
      .catch((error: Error) => {
        this.snackbarService.error(`Error al procesar el archivo: ${error.message}`);
        this.resetFileInput();
      })
      .finally(() => {
        this.isLoading.set(false);
      });

  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  removeFile(): void {
    this.resetFileInput();
    this.snackbarService.info('Archivo eliminado');
  }

  private resetFileInput(): void {

    this.fileName.set('');
    this.excelFile = null;
    this.excelData.set(null);
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }

  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {

    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files?.length) {
      const mockEvent = { target: { files } } as unknown as Event;
      this.onFileSelected(mockEvent);
    }

  }

  onSubmit(): void {
    if (this.isEditMode()) {
      this.submitEdit();
    } else {
      this.submitCreate();
    }
  }

  private submitCreate(): void {

    if (this.candidateForm.invalid) {
      this.markFormGroupTouched(this.candidateForm);
      this.snackbarService.error('Por favor, complete todos los campos requeridos');
      return;
    }

    if (!this.excelFile) {
      this.snackbarService.error('Por favor, seleccione un archivo Excel');
      return;
    }

    this.isSubmitting.set(true);
    const { name, surname } = this.candidateForm.value;

    const candidateDto: CreateCandidateExcelDto =
    {
      name: name,
      surname: surname
    }

    this.candidateService.createWithExcel(candidateDto, this.excelFile)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackbarService.success('Candidato creado exitosamente');
          this.router.navigate(['/candidates']);
        },
        error: (error) => {
          this.snackbarService.error(`Error al crear candidato: ${error.message}`);
          this.isSubmitting.set(false);
        }
      });

  }

  private submitEdit(): void {

    if (this.editForm.invalid) {
      this.markFormGroupTouched(this.editForm);
      this.snackbarService.error('Por favor, complete todos los campos requeridos');
      return;
    }

    const id = this.candidateId();
    if (!id) return;

    this.isSubmitting.set(true);
    const formValue = this.editForm.value;

    const updatedCandidate: UpdateCandidateDto = {
      name: formValue.name,
      surname: formValue.surname,
      seniority: formValue.seniority,
      years: formValue.years,
      availability: formValue.availability
    };

    this.candidateService.update(id, updatedCandidate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackbarService.success('Candidato actualizado exitosamente');
          this.router.navigate(['/candidates']);
        },
        error: (error) => {
          this.snackbarService.error(`Error al actualizar candidato: ${error.message}`);
          this.isSubmitting.set(false);
        }
      });

  }


  cancel(): void {
    this.router.navigate(['/candidates']);
  }

  resetForm(): void {

    if (this.isEditMode()) {
      this.loadCandidateForEdit();
    } else {
      this.candidateForm.reset();
      this.resetFileInput();
    }
    this.snackbarService.info('Formulario reiniciado');

  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(controlName: string, form?: FormGroup): string {
    const currentForm = form || (this.isEditMode() ? this.editForm : this.candidateForm);
    const control = currentForm.get(controlName);

    if (!control?.errors) return '';

    const errors = control.errors;

    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['min']) return `El valor mínimo es ${errors['min'].min}`;
    if (errors['max']) return `El valor máximo es ${errors['max'].max}`;
    if (errors['pattern']) return 'Solo se permiten letras y espacios';

    return 'Campo inválido';
  }

  getSeniorityLabel(value: string): string {
    return this.seniorityOptions.find(opt => opt.value === value)?.label || value;
  }

  getAvailabilityLabel(value: boolean | string): string {
    const boolValue = typeof value === 'string' ? value === 'true' : value;
    return boolValue ? 'Disponible' : 'No disponible';
  }

}

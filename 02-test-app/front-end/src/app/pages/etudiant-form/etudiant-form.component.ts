import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { EtudiantService } from '../../core/service/etudiant.service';
import { EtudiantRequest } from '../../core/models/EtudiantRequest';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-etudiant-form',
  imports: [CommonModule, MaterialModule],
  templateUrl: './etudiant-form.component.html',
  standalone: true,
  styleUrl: './etudiant-form.component.css'
})
export class EtudiantFormComponent implements OnInit {
  private etudiantService = inject(EtudiantService);
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  etudiantForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  editId: number | null = null;

  get isEditMode(): boolean {
    return this.editId !== null;
  }

  get form() {
    return this.etudiantForm.controls;
  }

  ngOnInit(): void {
    this.etudiantForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      studentNumber: ['']
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editId = Number(idParam);
      this.isLoading = true;
      this.etudiantService.findById(this.editId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (etudiant) => {
            this.isLoading = false;
            this.etudiantForm.patchValue({
              firstName: etudiant.firstName,
              lastName: etudiant.lastName,
              email: etudiant.email,
              studentNumber: etudiant.studentNumber || ''
            });
          },
          error: (err) => {
            this.isLoading = false;
            this.errorMessage = err?.error?.message || 'Étudiant introuvable.';
          }
        });
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.etudiantForm.invalid) {
      return;
    }

    this.isLoading = true;

    const payload: EtudiantRequest = {
      firstName: this.etudiantForm.get('firstName')?.value,
      lastName: this.etudiantForm.get('lastName')?.value,
      email: this.etudiantForm.get('email')?.value,
      studentNumber: this.etudiantForm.get('studentNumber')?.value || undefined
    };

    const request$ = this.isEditMode
      ? this.etudiantService.update(this.editId!, payload)
      : this.etudiantService.create(payload);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/etudiants']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err?.error?.message || 'Une erreur est survenue.';
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/etudiants']);
  }
}

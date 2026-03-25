import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { EtudiantService } from '../../core/service/etudiant.service';
import { Etudiant } from '../../core/models/Etudiant';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-etudiant-detail',
  imports: [CommonModule, MaterialModule],
  templateUrl: './etudiant-detail.component.html',
  standalone: true,
  styleUrl: './etudiant-detail.component.css'
})
export class EtudiantDetailComponent implements OnInit {
  private etudiantService = inject(EtudiantService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  etudiant: Etudiant | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.isLoading = true;
    this.etudiantService.findById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.etudiant = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err?.error?.message || 'Étudiant introuvable.';
        }
      });
  }

  goToEdit(): void {
    this.router.navigate(['/etudiants', this.etudiant!.id, 'edit']);
  }

  goToList(): void {
    this.router.navigate(['/etudiants']);
  }
}

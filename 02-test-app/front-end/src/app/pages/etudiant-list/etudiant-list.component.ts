import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { EtudiantService } from '../../core/service/etudiant.service';
import { UserService } from '../../core/service/user.service';
import { Etudiant } from '../../core/models/Etudiant';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-etudiant-list',
  imports: [CommonModule, MaterialModule],
  templateUrl: './etudiant-list.component.html',
  standalone: true,
  styleUrl: './etudiant-list.component.css'
})
export class EtudiantListComponent implements OnInit {
  private etudiantService = inject(EtudiantService);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  etudiants: Etudiant[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    this.loadEtudiants();
  }

  loadEtudiants(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.etudiantService.findAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.etudiants = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err?.error?.message || 'Erreur lors du chargement des étudiants.';
        }
      });
  }

  goToDetail(id: number): void {
    this.router.navigate(['/etudiants', id]);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/etudiants', id, 'edit']);
  }

  goToCreate(): void {
    this.router.navigate(['/etudiants', 'new']);
  }

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  delete(id: number): void {
    if (!confirm('Confirmer la suppression de cet étudiant ?')) {
      return;
    }
    this.etudiantService.delete(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loadEtudiants(),
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Erreur lors de la suppression.';
        }
      });
  }
}

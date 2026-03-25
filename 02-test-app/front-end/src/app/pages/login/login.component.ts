import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { UserService } from '../../core/service/user.service';
import { Login } from '../../core/models/Login';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  imports: [CommonModule, MaterialModule],
  templateUrl: './login.component.html',
  standalone: true,
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private userService = inject(UserService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  loginForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      login: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get form() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;

    const credentials: Login = {
      login: this.loginForm.get('login')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.userService.login(credentials)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (jwtToken: string) => {
          this.isLoading = false;
          localStorage.setItem('token', jwtToken);
          this.router.navigate(['/etudiants']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err?.error || 'Identifiants invalides. Veuillez réessayer.';
        }
      });
  }

  onReset(): void {
    this.submitted = false;
    this.errorMessage = '';
    this.loginForm.reset();
  }
}

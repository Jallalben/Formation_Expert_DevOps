import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { EtudiantListComponent } from './pages/etudiant-list/etudiant-list.component';
import { EtudiantDetailComponent } from './pages/etudiant-detail/etudiant-detail.component';
import { EtudiantFormComponent } from './pages/etudiant-form/etudiant-form.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'register',
    pathMatch: 'full'
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'etudiants',
    component: EtudiantListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'etudiants/new',
    component: EtudiantFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'etudiants/:id',
    component: EtudiantDetailComponent,
    canActivate: [authGuard]
  },
  {
    path: 'etudiants/:id/edit',
    component: EtudiantFormComponent,
    canActivate: [authGuard]
  }
];
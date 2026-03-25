import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Etudiant } from '../models/Etudiant';
import { EtudiantRequest } from '../models/EtudiantRequest';

@Injectable({
  providedIn: 'root'
})
export class EtudiantService {

  constructor(private httpClient: HttpClient) {}

  findAll(): Observable<Etudiant[]> {
    return this.httpClient.get<Etudiant[]>('/api/etudiants');
  }

  findById(id: number): Observable<Etudiant> {
    return this.httpClient.get<Etudiant>(`/api/etudiants/${id}`);
  }

  create(etudiant: EtudiantRequest): Observable<Etudiant> {
    return this.httpClient.post<Etudiant>('/api/etudiants', etudiant);
  }

  update(id: number, etudiant: EtudiantRequest): Observable<Etudiant> {
    return this.httpClient.put<Etudiant>(`/api/etudiants/${id}`, etudiant);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`/api/etudiants/${id}`);
  }
}

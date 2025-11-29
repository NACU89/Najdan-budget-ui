import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, AllCategoryCriteria, CategoryUpsertDto } from '../domain';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/categories';

  findAll(criteria: AllCategoryCriteria = {}): Observable<Category[]> {
    let params = new HttpParams();

    if (criteria.sort) {
      params = params.set('sort', criteria.sort);
    }
    if (criteria.name) {
      params = params.set('name', criteria.name);
    }

    return this.http.get<Category[]>(this.baseUrl, { params });
  }

  findOne(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${id}`);
  }

  create(dto: CategoryUpsertDto): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, dto);
  }

  update(dto: CategoryUpsertDto): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${dto.id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}


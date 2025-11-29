import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expense, ExpenseCriteria, ExpenseUpsertDto, Page } from '../domain';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/expenses';

  findAll(criteria: ExpenseCriteria): Observable<Page<Expense>> {
    let params = new HttpParams()
      .set('page', criteria.page.toString())
      .set('size', criteria.size.toString())
      .set('sort', criteria.sort);

    if (criteria.name) {
      params = params.set('name', criteria.name);
    }
    if (criteria.yearMonth) {
      params = params.set('yearMonth', criteria.yearMonth);
    }
    if (criteria.categoryIds && criteria.categoryIds.length > 0) {
      criteria.categoryIds.forEach(id => {
        params = params.append('categoryIds', id);
      });
    }

    return this.http.get<Page<Expense>>(this.baseUrl, { params });
  }

  findOne(id: string): Observable<Expense> {
    return this.http.get<Expense>(`${this.baseUrl}/${id}`);
  }

  create(dto: ExpenseUpsertDto): Observable<Expense> {
    return this.http.post<Expense>(this.baseUrl, dto);
  }

  update(dto: ExpenseUpsertDto): Observable<Expense> {
    return this.http.put<Expense>(`${this.baseUrl}/${dto.id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}


import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Recipient, RecipientManagement, CreateRecipientRequest, UpdateRecipientRequest } from '../models/recipient.model';

@Injectable({
  providedIn: 'root'
})
export class RecipientService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}`;

  // Existing method used by Send Emails.
  getRecipientsByRecordId(recordId: number): Observable<Recipient[]> {
    return this.http.get<Recipient[]>(
      `${this.apiUrl}/records/${recordId}/recipients`
    );
  }

  // Retrieve recipients with optional search and status filters.
  getRecipients(
    search?: string,
    isActive?: boolean
  ): Observable<RecipientManagement[]> {

    let params = new HttpParams();

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    if (isActive !== undefined) {
      params = params.set('isActive', isActive);
    }

    return this.http.get<RecipientManagement[]>(
      `${this.apiUrl}/recipients`,
      { params }
    );
  }

  // Retrieve one recipient by ID.
  getRecipientById(id: number): Observable<RecipientManagement> {
    return this.http.get<RecipientManagement>(
      `${this.apiUrl}/recipients/${id}`
    );
  }

  // Create a new recipient.
  createRecipient(request: CreateRecipientRequest): Observable<number> {
    return this.http.post<number>(
      `${this.apiUrl}/recipients`,
      request
    );
  }

  // Update an existing recipient.
  updateRecipient(
    id: number,
    request: UpdateRecipientRequest
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/recipients/${id}`,
      request
    );
  }
}

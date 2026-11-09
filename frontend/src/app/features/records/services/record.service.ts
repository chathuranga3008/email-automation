import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { Record, RecordManagement, CreateRecordRequest, UpdateRecordRequest, RecordStatusRequest } from '../models/record.model';

@Injectable({
  providedIn: 'root'
})
export class RecordService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/records`;

  // Existing method used by Send Emails.
  // Returns active records only.
  getAllRecords(): Observable<Record[]> {
    return this.http.get<Record[]>(this.apiUrl);
  }

  // Retrieve records for Record Management.
  // Supports optional search and status filters.
  getRecords(
    search?: string,
    isActive?: boolean
  ): Observable<RecordManagement[]> {

    let params = new HttpParams();

    if (search?.trim()) {
      params = params.set('search', search.trim());
    }

    if (isActive !== undefined) {
      params = params.set('isActive', isActive);
    }

    return this.http.get<RecordManagement[]>(
      `${this.apiUrl}/manage`,
      { params }
    );
  }

  // Retrieve one record by ID.
  getRecordById(id: number): Observable<RecordManagement> {
    return this.http.get<RecordManagement>(
      `${this.apiUrl}/${id}`
    );
  }

  // Create a new record.
  createRecord(request: CreateRecordRequest): Observable<number> {
    return this.http.post<number>(
      this.apiUrl,
      request
    );
  }

  // Update an existing record.
  updateRecord(
    id: number,
    request: UpdateRecordRequest
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  // Activate or deactivate a record.
  updateRecordStatus(
    id: number,
    request: RecordStatusRequest
  ): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/${id}/status`,
      request
    );
  }
}

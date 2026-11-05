import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Recipient } from '../models/recipient.model';

@Injectable({
  providedIn: 'root'
})
export class RecipientService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/records`;

  getRecipientsByRecordId(recordId: number): Observable<Recipient[]> {
    return this.http.get<Recipient[]>(
      `${this.apiUrl}/${recordId}/recipients`
    );
  }
}

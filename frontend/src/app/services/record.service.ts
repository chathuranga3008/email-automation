import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Record } from '../models/record.model';

@Injectable({
  providedIn: 'root'
})
export class RecordService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/records`;

  getAllRecords(): Observable<Record[]> {
    return this.http.get<Record[]>(this.apiUrl);
  }
}

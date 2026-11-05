import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  SendEmailRequest,
  EmailJobResponse
} from '../models/email-job.model';

@Injectable({
  providedIn: 'root'
})
export class EmailJobService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/email-jobs`;

  createEmailJob(request: SendEmailRequest): Observable<EmailJobResponse> {
    return this.http.post<EmailJobResponse>(
      this.apiUrl,
      request
    );
  }
}

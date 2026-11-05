import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  SendEmailRequest,
  EmailJobResponse,
  EmailJobHistory,
  EmailJobDetails,
  EmailJobLog
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

  getEmailJobs(
    limit: number = 10,
    offset: number = 0
  ): Observable<EmailJobHistory[]> {
    return this.http.get<EmailJobHistory[]>(
      this.apiUrl,
      {
        params: {
          limit: limit,
          offset: offset
        }
      }
    );
  }

  getEmailJobDetails(jobId: number): Observable<EmailJobDetails> {
    return this.http.get<EmailJobDetails>(
      `${this.apiUrl}/${jobId}`
    );
  }

  getEmailJobLogs(jobId: number): Observable<EmailJobLog[]> {
    return this.http.get<EmailJobLog[]>(
      `${this.apiUrl}/${jobId}/logs`
    );
  }
}

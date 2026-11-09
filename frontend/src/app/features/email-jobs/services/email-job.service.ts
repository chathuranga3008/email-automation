import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { SendEmailRequest, EmailJobResponse, EmailJobHistory, EmailJobDetails, EmailJobLog } from '../models/email-job.model';

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
    offset: number = 0,
    search: string | null = null,
    status: string | null = null,
    createdFrom: string | null = null,
    createdTo: string | null = null
  ): Observable<EmailJobHistory[]> {

    let params = new HttpParams()
      .set('limit', limit)
      .set('offset', offset);

    if (search) {
      params = params.set('search', search);
    }

    if (status) {
      params = params.set('status', status);
    }

    if (createdFrom) {
      params = params.set('createdFrom', createdFrom);
    }

    if (createdTo) {
      params = params.set('createdTo', createdTo);
    }

    return this.http.get<EmailJobHistory[]>(
      this.apiUrl,
      { params }
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

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { EmailTemplate, UpdateEmailTemplateRequest, CreateEmailTemplateRequest } from '../models/email-template.model';

@Injectable({
  providedIn: 'root'
})
export class EmailTemplateService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/email-templates`;

  getAllTemplates(): Observable<EmailTemplate[]> {
    return this.http.get<EmailTemplate[]>(this.apiUrl);
  }

  createTemplate(request: CreateEmailTemplateRequest): Observable<number> {
    return this.http.post<number>(this.apiUrl, request);
  }

  setTemplateStatus(
    templateId: number,
    isActive: boolean
  ): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/${templateId}/status`,
      { isActive }
    );
  }

  updateTemplate(
    templateId: number,
    request: UpdateEmailTemplateRequest
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${templateId}`,
      request
    );
  }
}

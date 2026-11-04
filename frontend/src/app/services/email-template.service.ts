import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { EmailTemplate } from '../models/email-template.model';

@Injectable({
  providedIn: 'root'
})
export class EmailTemplateService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/email-templates`;

  getAllTemplates(): Observable<EmailTemplate[]> {
    return this.http.get<EmailTemplate[]>(this.apiUrl);
  }
}

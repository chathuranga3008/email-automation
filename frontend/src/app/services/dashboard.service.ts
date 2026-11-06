import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import { DashboardSummary, RecentEmailJob } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/dashboard`;

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(
      `${this.apiUrl}/summary`
    );
  }

  getRecentJobs(): Observable<RecentEmailJob[]> {
    return this.http.get<RecentEmailJob[]>(
      `${this.apiUrl}/recent-jobs`
    );
  }
}

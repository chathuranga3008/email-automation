import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { DashboardService } from '../../services/dashboard.service';
import { DashboardSummary, RecentEmailJob } from '../../models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

  private dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);

  summary: DashboardSummary | null = null;
  recentJobs: RecentEmailJob[] = [];

  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      summary: this.dashboardService.getSummary().pipe(
        catchError(() => {
          this.errorMessage = 'Unable to load dashboard summary.';
          return of(null);
        })
      ),

      recentJobs: this.dashboardService.getRecentJobs().pipe(
        catchError(() => {
          this.errorMessage = 'Unable to load recent email jobs.';
          return of([] as RecentEmailJob[]);
        })
      )
    })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe(({ summary, recentJobs }) => {
        this.summary = summary;
        this.recentJobs = recentJobs;

        this.cdr.markForCheck();
      });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }
}

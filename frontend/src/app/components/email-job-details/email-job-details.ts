import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { EmailJobService } from '../../services/email-job.service';
import { EmailJobDetails, EmailJobLog } from '../../models/email-job.model';

@Component({
  selector: 'app-email-job-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './email-job-details.html',
  styleUrl: './email-job-details.scss'
})
export class EmailJobDetailsPage implements OnInit {

  private route = inject(ActivatedRoute);
  private emailJobService = inject(EmailJobService);
  private cdr = inject(ChangeDetectorRef);

  jobDetails: EmailJobDetails | null = null;
  logs: EmailJobLog[] = [];

  loading = false;
  errorMessage = '';

  ngOnInit(): void {

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage = 'Invalid email job ID.';
      return;
    }

    this.loadDetails(id);
  }

  loadDetails(jobId: number): void {

    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      details: this.emailJobService.getEmailJobDetails(jobId),
      logs: this.emailJobService.getEmailJobLogs(jobId)
    }).subscribe({

      next: (result) => {

        this.jobDetails = result.details;
        this.logs = result.logs;

        this.loading = false;

        this.cdr.markForCheck();
      },

      error: () => {

        this.errorMessage =
          'Unable to load email job details. The job may not exist.';

        this.jobDetails = null;
        this.logs = [];

        this.loading = false;

        this.cdr.markForCheck();
      }

    });
  }

  getStatusClass(status: string): string {

    switch (status) {
      case 'COMPLETED':
      case 'SENT':
        return 'completed';

      case 'PARTIAL':
        return 'partial';

      case 'FAILED':
        return 'failed';

      case 'PROCESSING':
      case 'RETRYING':
        return 'processing';

      case 'PENDING':
        return 'pending';

      default:
        return 'unknown';
    }
  }
}

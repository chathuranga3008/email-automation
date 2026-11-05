import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { EmailJobService } from '../../services/email-job.service';
import { EmailJobHistory } from '../../models/email-job.model';

@Component({
  selector: 'app-email-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './email-history.html',
  styleUrl: './email-history.scss'
})
export class EmailHistory implements OnInit {

  private emailJobService = inject(EmailJobService);
  private cdr = inject(ChangeDetectorRef);

  jobs: EmailJobHistory[] = [];

  loading = false;
  errorMessage = '';

  currentPage = 0;
  readonly pageSize = 10;
  hasNextPage = false;

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {

    this.loading = true;
    this.errorMessage = '';

    const offset = this.currentPage * this.pageSize;

    this.emailJobService.getEmailJobs(
      this.pageSize + 1,
      offset
    ).subscribe({

      next: (data) => {

        this.hasNextPage = data.length > this.pageSize;

        this.jobs = data.slice(0, this.pageSize);

        this.cdr.markForCheck();
      },

      error: () => {

        this.errorMessage = 'Unable to load email history. Please try again.';

        this.jobs = [];
        this.hasNextPage = false;

        this.loading = false;

        this.cdr.markForCheck();
      },

      complete: () => {

        this.loading = false;

        this.cdr.markForCheck();
      }

    });
  }

  nextPage(): void {

    if (!this.hasNextPage || this.loading) {
      return;
    }

    this.currentPage++;

    this.loadJobs();
  }

  previousPage(): void {

    if (this.currentPage === 0 || this.loading) {
      return;
    }

    this.currentPage--;

    this.loadJobs();
  }

  getStatusClass(status: string): string {

    switch (status) {
      case 'COMPLETED':
        return 'completed';

      case 'PARTIAL':
        return 'partial';

      case 'FAILED':
        return 'failed';

      case 'PROCESSING':
        return 'processing';

      case 'PENDING':
        return 'pending';

      default:
        return 'unknown';
    }
  }
}

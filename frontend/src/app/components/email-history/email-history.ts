import { Component, OnInit, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, catchError, finalize } from 'rxjs/operators';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { EmailJobService } from '../../services/email-job.service';
import { EmailJobHistory } from '../../models/email-job.model';

interface EmailHistoryFilters {
  search: string;
  status: string;
  createdFrom: string;
  createdTo: string;
  page: number;
}

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
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  private searchChanges = new Subject<string>();

  jobs: EmailJobHistory[] = [];

  loading = false;
  errorMessage = '';

  searchTerm = '';
  selectedStatus = '';
  createdFrom = '';
  createdTo = '';

  currentPage = 0;
  readonly pageSize = 10;
  hasNextPage = false;

  ngOnInit(): void {

    this.setupSearchDebounce();

    this.route.queryParamMap.pipe(

      map(params => {

        const pageValue = Number(params.get('page') ?? '0');

        return {
          search: params.get('search') ?? '',
          status: params.get('status') ?? '',
          createdFrom: params.get('createdFrom') ?? '',
          createdTo: params.get('createdTo') ?? '',
          page: Number.isInteger(pageValue) && pageValue >= 0
            ? pageValue
            : 0
        } as EmailHistoryFilters;
      }),

      distinctUntilChanged((previous, current) =>
        previous.search === current.search &&
        previous.status === current.status &&
        previous.createdFrom === current.createdFrom &&
        previous.createdTo === current.createdTo &&
        previous.page === current.page
      ),

      takeUntilDestroyed(this.destroyRef),

      switchMap(filters => {

        this.searchTerm = filters.search;
        this.selectedStatus = filters.status;
        this.createdFrom = filters.createdFrom;
        this.createdTo = filters.createdTo;
        this.currentPage = filters.page;

        this.loading = true;
        this.errorMessage = '';

        const offset = filters.page * this.pageSize;

        return this.emailJobService.getEmailJobs(
          this.pageSize + 1,
          offset,
          filters.search || null,
          filters.status || null,
          filters.createdFrom || null,
          filters.createdTo || null
        ).pipe(

          catchError(() => {

            this.errorMessage =
              'Unable to load email history. Please try again.';

            return of(null);
          }),

          finalize(() => {

            this.loading = false;
            this.cdr.markForCheck();
          })
        );
      })
    ).subscribe(data => {

      if (data === null) {

        this.jobs = [];
        this.hasNextPage = false;
      } else {

        this.hasNextPage = data.length > this.pageSize;
        this.jobs = data.slice(0, this.pageSize);
      }

      this.cdr.markForCheck();
    });
  }

  loadJobs(): void {

    this.loading = true;
    this.errorMessage = '';

    const offset = this.currentPage * this.pageSize;

    this.emailJobService.getEmailJobs(
      this.pageSize + 1,
      offset,
      this.searchTerm || null,
      this.selectedStatus || null,
      this.createdFrom || null,
      this.createdTo || null
    ).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => {

        this.errorMessage =
          'Unable to load email history. Please try again.';

        this.jobs = [];
        this.hasNextPage = false;

        return of(null);

      }),
      finalize(() => {

        this.loading = false;
        this.cdr.markForCheck();

      })
    ).subscribe(data => {

      if (data !== null) {

        this.hasNextPage = data.length > this.pageSize;
        this.jobs = data.slice(0, this.pageSize);

      }

      this.cdr.markForCheck();

    });

  }

  private setupSearchDebounce(): void {

    this.searchChanges.pipe(

      debounceTime(300),

      distinctUntilChanged(),

      takeUntilDestroyed(this.destroyRef)
    ).subscribe(search => {

      const currentSearch =
        this.route.snapshot.queryParamMap.get('search') ?? '';

      if (search !== currentSearch) {
        this.updateQueryParams({
          search: search || null,
          page: null
        });
      }
    });
  }

  onSearchChange(value: string): void {

    this.searchTerm = value;
    this.searchChanges.next(value);
  }

  onStatusChange(value: string): void {

    this.updateQueryParams({
      status: value || null,
      page: null
    });
  }

  onCreatedFromChange(value: string): void {

    this.updateQueryParams({
      createdFrom: value || null,
      page: null
    });
  }

  onCreatedToChange(value: string): void {

    this.updateQueryParams({
      createdTo: value || null,
      page: null
    });
  }

  clearFilters(): void {

    this.searchTerm = '';
    this.searchChanges.next('');

    this.updateQueryParams({
      search: null,
      status: null,
      createdFrom: null,
      createdTo: null,
      page: null
    });
  }

  nextPage(): void {

    if (!this.hasNextPage || this.loading) {
      return;
    }

    this.updateQueryParams({
      page: this.currentPage + 1
    });
  }

  previousPage(): void {

    if (this.currentPage === 0 || this.loading) {
      return;
    }

    this.updateQueryParams({
      page: this.currentPage - 1
    });
  }

  private updateQueryParams(params: Record<string, string | number | null>): void {

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
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

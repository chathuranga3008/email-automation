import { Component, OnInit, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Subject, debounceTime, switchMap, catchError, of, EMPTY, tap, finalize } from 'rxjs';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { RecordService } from '../../services/record.service';
import { RecordManagement } from '../../models/record.model';

@Component({
  selector: 'app-records',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './records.html',
  styleUrl: './records.scss'
})
export class Records implements OnInit {

  private recordService = inject(RecordService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  private filterSubject = new Subject<void>();

  records: RecordManagement[] = [];

  searchTerm = '';
  selectedStatus = 'all';

  loading = false;
  errorMessage = '';

  updatingRecordIds = new Set<number>();

  ngOnInit(): void {

    this.filterSubject.pipe(

      debounceTime(300),

      switchMap(() => {

        this.loading = true;
        this.errorMessage = '';

        this.cdr.markForCheck();

        const isActive =
          this.selectedStatus === 'all'
            ? undefined
            : this.selectedStatus === 'active';

        return this.recordService.getRecords(
          this.searchTerm,
          isActive
        ).pipe(

          catchError(() => {
            this.errorMessage = 'Unable to load records.';
            return of([] as RecordManagement[]);
          }),

          finalize(() => {
            this.loading = false;
            this.cdr.markForCheck();
          })

        );
      }),

      takeUntilDestroyed(this.destroyRef)

    ).subscribe(data => {

      this.records = data;
      this.cdr.markForCheck();

    });

    this.loadRecords();
  }

  // Request records from the backend.
  loadRecords(): void {
    this.filterSubject.next();
  }

  // Handle live search.
  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.loadRecords();
  }

  // Handle status filtering.
  onStatusChange(): void {
    this.loadRecords();
  }

  // Reset all filters.
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';

    this.loadRecords();
  }

  // Activate or deactivate a record.
  toggleRecordStatus(record: RecordManagement): void {

    if (this.updatingRecordIds.has(record.id)) {
      return;
    }

    const action = record.isActive ? 'deactivate' : 'activate';

    const confirmed = window.confirm(
      `Are you sure you want to ${action} record "${record.recordTitle}"?`
    );

    if (!confirmed) {
      return;
    }

    this.updatingRecordIds.add(record.id);
    this.errorMessage = '';

    this.cdr.markForCheck();

    this.recordService.updateRecordStatus(
      record.id,
      { isActive: !record.isActive }
    ).pipe(

      // Reload the list after a successful status update.
      tap(() => {
        this.loadRecords();
      }),

      catchError(error => {

        this.errorMessage =
          error?.error?.message ||
          error?.error?.detail ||
          `Unable to ${action} record. Please try again.`;

        return EMPTY;

      }),

      finalize(() => {

        this.updatingRecordIds.delete(record.id);

        this.cdr.markForCheck();

      }),

      takeUntilDestroyed(this.destroyRef)

    ).subscribe();
  }
}

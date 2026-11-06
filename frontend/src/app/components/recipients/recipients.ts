import { Component, OnInit, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Subject, debounceTime, switchMap, catchError, of, EMPTY, tap, finalize } from 'rxjs';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { RecipientService } from '../../services/recipient.service';
import { RecipientManagement, RecipientStatusRequest } from '../../models/recipient.model';

@Component({
  selector: 'app-recipients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recipients.html',
  styleUrl: './recipients.scss'
})
export class Recipients implements OnInit {

  private recipientService = inject(RecipientService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  private filterSubject = new Subject<void>();

  // Used by the template to disable individual status buttons.
  updatingRecipientIds = new Set<number>();

  recipients: RecipientManagement[] = [];

  searchTerm = '';
  selectedStatus = 'all';

  loading = false;
  errorMessage = '';

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

        return this.recipientService.getRecipients(
          this.searchTerm,
          isActive
        ).pipe(

          catchError(() => {
            this.errorMessage = 'Unable to load recipients.';
            return of([] as RecipientManagement[]);
          }),

          finalize(() => {
            this.loading = false;
            this.cdr.markForCheck();
          })

        );
      }),

      takeUntilDestroyed(this.destroyRef)

    ).subscribe(data => {

      this.recipients = data;
      this.cdr.markForCheck();

    });

    // Load recipients when the page is first opened.
    this.loadRecipients();
  }

  // Request recipients from the backend.
  loadRecipients(): void {
    this.filterSubject.next();
  }

  // Handle live search.
  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.loadRecipients();
  }

  // Handle status filtering.
  onStatusChange(): void {
    this.loadRecipients();
  }

  // Reset all filters.
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';

    this.loadRecipients();
  }

  // Activate or deactivate a recipient.
  toggleRecipientStatus(recipient: RecipientManagement): void {

    if (this.updatingRecipientIds.has(recipient.recipientId)) {
      return;
    }

    const action = recipient.isActive ? 'deactivate' : 'activate';

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${recipient.recipientName}?`
    );

    if (!confirmed) {
      return;
    }

    const request: RecipientStatusRequest = {
      isActive: !recipient.isActive
    };

    this.updatingRecipientIds.add(recipient.recipientId);
    this.errorMessage = '';

    this.cdr.markForCheck();

    this.recipientService.updateRecipientStatus(
      recipient.recipientId,
      request
    ).pipe(

      // Only reload after the backend confirms the status update.
      tap(() => {
        this.loadRecipients();
      }),

      catchError(error => {

        this.errorMessage =
          error?.error?.message ||
          error?.error?.detail ||
          `Unable to ${action} recipient. Please try again.`;

        return EMPTY;

      }),

      finalize(() => {

        this.updatingRecipientIds.delete(recipient.recipientId);

        this.cdr.markForCheck();

      }),

      takeUntilDestroyed(this.destroyRef)

    ).subscribe();
  }
}

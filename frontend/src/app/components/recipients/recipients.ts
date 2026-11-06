import { Component, OnInit, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Subject, debounceTime, switchMap, catchError, of, tap } from 'rxjs';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { RecipientService } from '../../services/recipient.service';
import { RecipientManagement } from '../../models/recipient.model';

@Component({
  selector: 'app-recipients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink ],
  templateUrl: './recipients.html',
  styleUrl: './recipients.scss'
})
export class Recipients implements OnInit {

  private recipientService = inject(RecipientService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  private filterSubject = new Subject<void>();

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
          })

        );
      }),

      tap(() => {
        this.loading = false;
        this.cdr.markForCheck();
      }),

      takeUntilDestroyed(this.destroyRef)

    ).subscribe(data => {

      this.recipients = data;
      this.cdr.markForCheck();

    });

    // Load recipients when the page is first opened.
    this.loadRecipients();
  }

  loadRecipients(): void {
    this.filterSubject.next();
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.loadRecipients();
  }

  onStatusChange(): void {
    this.loadRecipients();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';

    this.loadRecipients();
  }
}

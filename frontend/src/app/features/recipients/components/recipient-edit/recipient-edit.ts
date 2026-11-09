import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { RecipientService } from '../../services/recipient.service';
import { StatePreservationService } from '../../../../services/state-preservation.service';
import { UpdateRecipientRequest } from '../../models/recipient.model';

interface EditRecipientDraft {
  recipientName: string;
  emailAddress: string;
}

@Component({
  selector: 'app-recipient-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recipient-edit.html',
  styleUrl: './recipient-edit.scss'
})
export class RecipientEdit implements OnInit, OnDestroy {

  private recipientService = inject(RecipientService);
  private stateService = inject(StatePreservationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private recipientId = 0;
  private preserveDraftOnDestroy = true;

  recipientName = '';
  emailAddress = '';

  loading = false;
  saving = false;
  errorMessage = '';

  private get stateKey(): string {
    return `recipient-edit-draft-v1-${this.recipientId}`;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage = 'Invalid recipient ID.';
      return;
    }

    this.recipientId = id;
    this.loadRecipient();
  }

  ngOnDestroy(): void {
    if (this.preserveDraftOnDestroy && this.recipientId > 0) {
      this.saveDraft();
    }
  }

  private loadRecipient(): void {
    this.loading = true;
    this.errorMessage = '';

    this.recipientService.getRecipientById(this.recipientId).subscribe({
      next: recipient => {
        this.recipientName = recipient.recipientName;
        this.emailAddress = recipient.emailAddress;

        this.restoreDraft();

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: error => {
        this.loading = false;
        this.errorMessage =
          error?.error?.message ||
          error?.error?.detail ||
          'Unable to load recipient details.';

        this.cdr.markForCheck();
      }
    });
  }

  private restoreDraft(): void {
    const draft = this.stateService.getState<EditRecipientDraft>(
      this.stateKey
    );

    if (!draft) {
      return;
    }

    if (
      typeof draft.recipientName !== 'string' ||
      typeof draft.emailAddress !== 'string'
    ) {
      this.stateService.clearState(this.stateKey);
      return;
    }

    this.recipientName = draft.recipientName;
    this.emailAddress = draft.emailAddress;
  }

  saveDraft(): void {
    if (this.recipientId <= 0) {
      return;
    }

    const draft: EditRecipientDraft = {
      recipientName: this.recipientName,
      emailAddress: this.emailAddress
    };

    this.stateService.saveState(this.stateKey, draft);
  }

  private discardDraft(): void {
    this.preserveDraftOnDestroy = false;
    this.stateService.clearState(this.stateKey);
  }

  cancel(): void {
    this.discardDraft();
    this.router.navigate(['/recipients']);
  }

  updateRecipient(): void {
    this.errorMessage = '';

    const request: UpdateRecipientRequest = {
      recipientName: this.recipientName.trim(),
      emailAddress: this.emailAddress.trim()
    };

    if (!request.recipientName || !request.emailAddress) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    this.saving = true;

    this.recipientService.updateRecipient(
      this.recipientId,
      request
    ).subscribe({
      next: () => {
        this.saving = false;
        this.discardDraft();
        this.cdr.markForCheck();
        this.router.navigate(['/recipients']);
      },
      error: error => {
        this.saving = false;
        this.errorMessage =
          error?.error?.message ||
          error?.error?.detail ||
          'Unable to update recipient. Please try again.';

        this.cdr.markForCheck();
      }
    });
  }
}

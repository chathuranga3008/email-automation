import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { RecipientService } from '../../services/recipient.service';
import { StatePreservationService } from '../../../../core/services/state-preservation.service';
import { CreateRecipientRequest } from '../../models/recipient.model';

interface CreateRecipientDraft {
  recipientName: string;
  emailAddress: string;
}

@Component({
  selector: 'app-recipient-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recipient-create.html',
  styleUrl: './recipient-create.scss'
})
export class RecipientCreate implements OnInit, OnDestroy {

  private recipientService = inject(RecipientService);
  private stateService = inject(StatePreservationService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private readonly stateKey = 'recipient-create-draft-v1';
  private preserveDraftOnDestroy = true;

  recipientName = '';
  emailAddress = '';

  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.restoreDraft();
  }

  ngOnDestroy(): void {
    if (this.preserveDraftOnDestroy) {
      this.saveDraft();
    }
  }

  private restoreDraft(): void {
    const draft = this.stateService.getState<CreateRecipientDraft>(
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

    this.cdr.markForCheck();
  }

  saveDraft(): void {
    const draft: CreateRecipientDraft = {
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

  createRecipient(): void {

    this.errorMessage = '';

    const request: CreateRecipientRequest = {
      recipientName: this.recipientName.trim(),
      emailAddress: this.emailAddress.trim()
    };

    if (!request.recipientName || !request.emailAddress) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    this.loading = true;

    this.recipientService.createRecipient(request).subscribe({

      next: () => {

        this.loading = false;

        this.discardDraft();

        this.cdr.markForCheck();

        this.router.navigate(['/recipients']);

      },

      error: (error) => {

        this.loading = false;

        this.errorMessage =
          error?.error?.message ||
          error?.error?.detail ||
          'Unable to create recipient. Please check the email address and try again.';

        this.cdr.markForCheck();

      }
    });
  }
}

import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { RecordService } from '../../services/record.service';
import { StatePreservationService } from '../../../../services/state-preservation.service';
import { CreateRecordRequest } from '../../models/record.model';

interface CreateRecordDraft {
  recordReference: string;
  recordTitle: string;
  description: string;
}

@Component({
  selector: 'app-record-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './record-create.html',
  styleUrl: './record-create.scss'
})
export class RecordCreate implements OnInit, OnDestroy {

  private recordService = inject(RecordService);
  private stateService = inject(StatePreservationService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private readonly stateKey = 'record-create-draft-v1';
  private preserveDraftOnDestroy = true;

  recordReference = '';
  recordTitle = '';
  description = '';

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

    const draft = this.stateService.getState<CreateRecordDraft>(
      this.stateKey
    );

    if (!draft) {
      return;
    }

    if (
      typeof draft.recordReference !== 'string' ||
      typeof draft.recordTitle !== 'string' ||
      typeof draft.description !== 'string'
    ) {
      this.stateService.clearState(this.stateKey);
      return;
    }

    this.recordReference = draft.recordReference;
    this.recordTitle = draft.recordTitle;
    this.description = draft.description;

    this.cdr.markForCheck();
  }

  saveDraft(): void {

    const draft: CreateRecordDraft = {
      recordReference: this.recordReference,
      recordTitle: this.recordTitle,
      description: this.description
    };

    this.stateService.saveState(this.stateKey, draft);
  }

  private discardDraft(): void {
    this.preserveDraftOnDestroy = false;
    this.stateService.clearState(this.stateKey);
  }

  cancel(): void {
    this.discardDraft();
    this.router.navigate(['/records']);
  }

  createRecord(): void {

    this.errorMessage = '';

    const request: CreateRecordRequest = {
      recordReference: this.recordReference.trim(),
      recordTitle: this.recordTitle.trim(),
      description: this.description.trim() || null
    };

    if (!request.recordReference || !request.recordTitle) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    this.loading = true;

    this.recordService.createRecord(request).subscribe({

      next: () => {

        this.loading = false;

        this.discardDraft();

        this.cdr.markForCheck();

        this.router.navigate(['/records']);

      },

      error: error => {

        this.loading = false;

        this.errorMessage =
          error?.error?.message ||
          error?.error?.detail ||
          'Unable to create record. Please check the record reference and try again.';

        this.cdr.markForCheck();

      }
    });
  }
}

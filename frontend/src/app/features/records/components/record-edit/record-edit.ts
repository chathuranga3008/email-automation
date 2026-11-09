import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { RecordService } from '../../services/record.service';
import { StatePreservationService } from '../../../../core/services/state-preservation.service';
import { UpdateRecordRequest } from '../../models/record.model';

interface EditRecordDraft {
  recordReference: string;
  recordTitle: string;
  description: string;
}

@Component({
  selector: 'app-record-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './record-edit.html',
  styleUrl: './record-edit.scss'
})
export class RecordEdit implements OnInit, OnDestroy {

  private recordService = inject(RecordService);
  private stateService = inject(StatePreservationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  recordId = 0;

  private recordLoaded = false;
  private preserveDraftOnDestroy = true;

  recordReference = '';
  recordTitle = '';
  description = '';

  loading = false;
  saving = false;
  errorMessage = '';

  private get stateKey(): string {
    return `record-edit-draft-v1-${this.recordId}`;
  }

  ngOnInit(): void {

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage = 'Invalid record ID.';
      return;
    }

    this.recordId = id;
    this.loadRecord();
  }

  ngOnDestroy(): void {

    if (this.preserveDraftOnDestroy && this.recordLoaded) {
      this.saveDraft();
    }
  }

  private loadRecord(): void {

    this.loading = true;
    this.errorMessage = '';

    this.recordService.getRecordById(this.recordId).subscribe({

      next: record => {

        this.recordReference = record.recordReference;
        this.recordTitle = record.recordTitle;
        this.description = record.description || '';

        this.recordLoaded = true;

        this.restoreDraft();

        this.loading = false;
        this.cdr.markForCheck();

      },

      error: error => {

        this.loading = false;

        this.errorMessage =
          error?.error?.message ||
          error?.error?.detail ||
          'Unable to load record details.';

        this.cdr.markForCheck();

      }
    });
  }

  private restoreDraft(): void {

    const draft = this.stateService.getState<EditRecordDraft>(
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
  }

  saveDraft(): void {

    if (!this.recordLoaded) {
      return;
    }

    const draft: EditRecordDraft = {
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

  updateRecord(): void {

    this.errorMessage = '';

    const request: UpdateRecordRequest = {
      recordReference: this.recordReference.trim(),
      recordTitle: this.recordTitle.trim(),
      description: this.description.trim() || null
    };

    if (!request.recordReference || !request.recordTitle) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    this.saving = true;

    this.recordService.updateRecord(
      this.recordId,
      request
    ).subscribe({

      next: () => {

        this.saving = false;

        this.discardDraft();

        this.cdr.markForCheck();

        this.router.navigate(['/records']);

      },

      error: error => {

        this.saving = false;

        this.errorMessage =
          error?.error?.message ||
          error?.error?.detail ||
          'Unable to update record. Please check the record reference and try again.';

        this.cdr.markForCheck();

      }
    });
  }
}

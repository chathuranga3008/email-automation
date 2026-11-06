import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import { RecordService } from '../../services/record.service';
import { RecipientService } from '../../services/recipient.service';
import { EmailTemplateService } from '../../services/email-template.service';
import { EmailJobService } from '../../services/email-job.service';
import { StatePreservationService } from '../../services/state-preservation.service';

import { Record as EmailRecord } from '../../models/record.model';
import { Recipient } from '../../models/recipient.model';
import { EmailTemplate } from '../../models/email-template.model';

import { SendEmailRequest, EmailJobResponse } from '../../models/email-job.model';

interface SendEmailsState {
  selectedRecordId: number | null;
  selectedTemplateId: number | null;
  idempotencyKey: string | null;
}

@Component({
  selector: 'app-send-emails',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './send-emails.html',
  styleUrl: './send-emails.scss'
})
export class SendEmails implements OnInit, OnDestroy {

  private recordService = inject(RecordService);
  private recipientService = inject(RecipientService);
  private templateService = inject(EmailTemplateService);
  private emailJobService = inject(EmailJobService);
  private stateService = inject(StatePreservationService);
  private cdr = inject(ChangeDetectorRef);

  private readonly stateKey = 'send-emails-state-v1';

  private recipientRequest?: Subscription;

  records: EmailRecord[] = [];
  templates: EmailTemplate[] = [];
  recipients: Recipient[] = [];

  selectedRecordId: number | null = null;
  selectedTemplateId: number | null = null;

  loadingPage = false;
  loadingRecipients = false;
  sending = false;

  recordsError = '';
  templatesError = '';
  recipientError = '';
  errorMessage = '';
  successMessage = '';

  createdJob: EmailJobResponse | null = null;

  private idempotencyKey: string | null = null;

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.recipientRequest?.unsubscribe();
  }

  loadInitialData(): void {

    this.loadingPage = true;

    this.recordsError = '';
    this.templatesError = '';

    forkJoin({

      records: this.recordService.getAllRecords().pipe(
        catchError(() => {
          this.recordsError = 'Unable to load records.';
          return of([] as EmailRecord[]);
        })
      ),

      templates: this.templateService.getAllTemplates().pipe(
        catchError(() => {
          this.templatesError = 'Unable to load email templates.';
          return of([] as EmailTemplate[]);
        })
      )

    })
    .pipe(
      finalize(() => {
        this.loadingPage = false;
        this.cdr.markForCheck();
      })
    )
    .subscribe(({ records, templates }) => {

      this.records = records;

      // Inactive templates must not be available for sending.
      this.templates = templates.filter(template => template.isActive);

      // Restore selections only after both lists load successfully.
      if (!this.recordsError && !this.templatesError) {
        this.restoreSavedState();
      }

      this.cdr.markForCheck();
    });
  }

  private restoreSavedState(): void {

    const savedState =
      this.stateService.getState<SendEmailsState>(this.stateKey);

    if (!savedState) {
      return;
    }

    const recordExists =
      typeof savedState.selectedRecordId === 'number' &&
      this.records.some(
        record => record.id === savedState.selectedRecordId
      );

    const templateExists =
      typeof savedState.selectedTemplateId === 'number' &&
      this.templates.some(
        template => template.id === savedState.selectedTemplateId
      );

    this.selectedRecordId = recordExists
      ? savedState.selectedRecordId
      : null;

    this.selectedTemplateId = templateExists
      ? savedState.selectedTemplateId
      : null;

    // Only restore the key when both selections are still valid.
    this.idempotencyKey =
      recordExists &&
      templateExists &&
      typeof savedState.idempotencyKey === 'string'
        ? savedState.idempotencyKey
        : null;

    this.savePageState();

    // Recipient information is always reloaded from the backend.
    if (this.selectedRecordId !== null) {
      this.loadRecipients(this.selectedRecordId);
    }
  }

  private savePageState(): void {

    const state: SendEmailsState = {
      selectedRecordId: this.selectedRecordId,
      selectedTemplateId: this.selectedTemplateId,
      idempotencyKey: this.idempotencyKey
    };

    this.stateService.saveState(this.stateKey, state);
  }

  onRecordChange(recordId: number | null): void {

    this.selectedRecordId = recordId;

    this.recipients = [];
    this.recipientError = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.createdJob = null;
    this.idempotencyKey = null;

    this.recipientRequest?.unsubscribe();

    this.savePageState();

    if (recordId === null) {
      this.loadingRecipients = false;
      return;
    }

    this.loadRecipients(recordId);
  }

  private loadRecipients(recordId: number): void {

    this.recipients = [];
    this.recipientError = '';

    this.recipientRequest?.unsubscribe();

    this.loadingRecipients = true;

    this.recipientRequest = this.recipientService
      .getRecipientsByRecordId(recordId)
      .pipe(
        finalize(() => {
          this.loadingRecipients = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({

        next: recipients => {
          this.recipients = recipients;
          this.cdr.markForCheck();
        },

        error: () => {
          this.recipientError = 'Unable to load recipients for this record.';
          this.cdr.markForCheck();
        }

      });
  }

  onTemplateChange(templateId: number | null): void {

    this.selectedTemplateId = templateId;

    this.errorMessage = '';
    this.successMessage = '';
    this.createdJob = null;
    this.idempotencyKey = null;

    this.savePageState();
  }

  get selectedRecord(): EmailRecord | undefined {
    return this.records.find(
      record => record.id === this.selectedRecordId
    );
  }

  get selectedTemplate(): EmailTemplate | undefined {
    return this.templates.find(
      template => template.id === this.selectedTemplateId
    );
  }

  get previewRecipientName(): string {
    return this.recipients.length > 0
      ? this.recipients[0].recipientName
      : 'Sample Recipient';
  }

  get previewSubject(): string {

    if (!this.selectedTemplate || !this.selectedRecord) {
      return '';
    }

    return this.replacePlaceholders(
      this.selectedTemplate.subjectTemplate,
      false
    );
  }

  get previewBodyHtml(): string {

    if (!this.selectedTemplate || !this.selectedRecord) {
      return '';
    }

    return this.replacePlaceholders(
      this.selectedTemplate.bodyHtml ?? '',
      true
    );
  }

  private replacePlaceholders(
    content: string,
    escapeValues: boolean
  ): string {

    const recipientName = this.previewRecipientName;
    const recordTitle = this.selectedRecord?.recordTitle ?? '';
    const recordReference = this.selectedRecord?.recordReference ?? '';

    const escapeHtml = (value: string): string => {
      return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    const replaceValue = (value: string): string => {
      return escapeValues ? escapeHtml(value) : value;
    };

    return content
      .split('{{recipientName}}')
      .join(replaceValue(recipientName))
      .split('{{recordTitle}}')
      .join(replaceValue(recordTitle))
      .split('{{recordReference}}')
      .join(replaceValue(recordReference));
  }

  get canSend(): boolean {

    return !!this.selectedRecordId
      && !!this.selectedTemplateId
      && !this.loadingRecipients
      && !this.sending
      && this.recipients.length > 0
      && this.recipients.length <= 10;
  }

  sendEmails(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.selectedRecordId || !this.selectedTemplateId) {
      this.errorMessage = 'Please select a record and an email template.';
      return;
    }

    if (this.recipients.length === 0) {
      this.errorMessage = 'No active recipients found for this record.';
      return;
    }

    if (this.recipients.length > 10) {
      this.errorMessage = 'A job cannot contain more than 10 recipients.';
      return;
    }

    if (this.sending) {
      return;
    }

    // Generate once per intentional send operation.
    if (!this.idempotencyKey) {
      this.idempotencyKey = crypto.randomUUID();
    }

    // Save before sending so a retry can reuse the same key.
    this.savePageState();

    const request: SendEmailRequest = {
      recordId: this.selectedRecordId,
      templateId: this.selectedTemplateId,
      idempotencyKey: this.idempotencyKey
    };

    this.sending = true;

    this.emailJobService.createEmailJob(request)
      .pipe(
        finalize(() => {
          this.sending = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({

        next: response => {

          this.createdJob = response;

          this.successMessage = 'Email job created successfully.';

          // Preserve selections, but never reuse a successful key.
          this.idempotencyKey = null;
          this.savePageState();

          this.cdr.markForCheck();
        },

        error: (error: HttpErrorResponse) => {

          this.errorMessage =
            error.error?.message ||
            error.error?.detail ||
            'Unable to create the email job. Please try again.';

          // The same idempotency key remains available for retry.
          this.savePageState();

          this.cdr.markForCheck();
        }
      });
  }
}

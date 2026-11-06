import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { EmailTemplateService } from '../../services/email-template.service';
import { StatePreservationService } from '../../services/state-preservation.service';
import { CreateEmailTemplateRequest } from '../../models/email-template.model';

interface CreateTemplateDraft {
  templateCode: string;
  templateName: string;
  subjectTemplate: string;
  bodyHtml: string;
  bodyText: string;
}

@Component({
  selector: 'app-email-template-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './email-template-create.html',
  styleUrl: './email-template-create.scss'
})
export class EmailTemplateCreate implements OnInit, OnDestroy {

  private emailTemplateService = inject(EmailTemplateService);
  private stateService = inject(StatePreservationService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private readonly stateKey = 'email-template-create-draft-v1';
  private preserveDraftOnDestroy = true;

  templateCode = '';
  templateName = '';
  subjectTemplate = '';
  bodyHtml = '';
  bodyText = '';

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
    const draft = this.stateService.getState<CreateTemplateDraft>(
      this.stateKey
    );

    if (!draft) {
      return;
    }

    if (
      typeof draft.templateCode !== 'string' ||
      typeof draft.templateName !== 'string' ||
      typeof draft.subjectTemplate !== 'string' ||
      typeof draft.bodyHtml !== 'string' ||
      typeof draft.bodyText !== 'string'
    ) {
      this.stateService.clearState(this.stateKey);
      return;
    }

    this.templateCode = draft.templateCode;
    this.templateName = draft.templateName;
    this.subjectTemplate = draft.subjectTemplate;
    this.bodyHtml = draft.bodyHtml;
    this.bodyText = draft.bodyText;

    this.cdr.markForCheck();
  }

  saveDraft(): void {
    const draft: CreateTemplateDraft = {
      templateCode: this.templateCode,
      templateName: this.templateName,
      subjectTemplate: this.subjectTemplate,
      bodyHtml: this.bodyHtml,
      bodyText: this.bodyText
    };

    this.stateService.saveState(this.stateKey, draft);
  }

  private discardDraft(): void {
    this.preserveDraftOnDestroy = false;
    this.stateService.clearState(this.stateKey);
  }

  cancel(): void {
    this.discardDraft();
    this.router.navigate(['/email-templates']);
  }

  createTemplate(): void {

    this.errorMessage = '';

    if (
      !this.templateCode.trim() ||
      !this.templateName.trim() ||
      !this.subjectTemplate.trim() ||
      !this.bodyHtml.trim()
    ) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    const request: CreateEmailTemplateRequest = {
      templateCode: this.templateCode.trim(),
      templateName: this.templateName.trim(),
      subjectTemplate: this.subjectTemplate.trim(),
      bodyHtml: this.bodyHtml,
      bodyText: this.bodyText.trim() || null
    };

    this.loading = true;

    this.emailTemplateService.createTemplate(request).subscribe({

      next: (templateId) => {

        this.loading = false;

        this.discardDraft();

        this.cdr.markForCheck();

        this.router.navigate(['/email-templates', templateId]);

      },

      error: (error) => {

        this.loading = false;

        this.errorMessage =
          error?.error?.message ||
          error?.error?.detail ||
          'Unable to create email template. Please check the template code and try again.';

        this.cdr.markForCheck();

      }

    });
  }
}

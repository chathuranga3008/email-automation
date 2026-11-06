import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { EmailTemplateService } from '../../services/email-template.service';
import { StatePreservationService } from '../../services/state-preservation.service';

import { EmailTemplate, UpdateEmailTemplateRequest } from '../../models/email-template.model';

@Component({
  selector: 'app-email-template-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './email-template-edit.html',
  styleUrl: './email-template-edit.scss'
})
export class EmailTemplateEdit implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private emailTemplateService = inject(EmailTemplateService);
  private stateService = inject(StatePreservationService);
  private cdr = inject(ChangeDetectorRef);

  template: EmailTemplate | null = null;

  form: UpdateEmailTemplateRequest = {
    templateName: '',
    subjectTemplate: '',
    bodyHtml: '',
    bodyText: ''
  };

  loading = false;
  saving = false;

  errorMessage = '';

  private preserveDraftOnDestroy = true;

  ngOnInit(): void {
    this.loadTemplate();
  }

  ngOnDestroy(): void {
    if (this.preserveDraftOnDestroy) {
      this.saveDraft();
    }
  }

  private getDraftKey(): string | null {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      return null;
    }

    return `email-template-edit-${id}-v1`;
  }

  private restoreDraft(): void {
    const key = this.getDraftKey();

    if (!key) {
      return;
    }

    const draft = this.stateService.getState<UpdateEmailTemplateRequest>(
      key
    );

    if (!draft) {
      return;
    }

    if (
      typeof draft.templateName !== 'string' ||
      typeof draft.subjectTemplate !== 'string' ||
      typeof draft.bodyHtml !== 'string' ||
      (draft.bodyText !== null && typeof draft.bodyText !== 'string')
    ) {
      this.stateService.clearState(key);
      return;
    }

    this.form = {
      templateName: draft.templateName,
      subjectTemplate: draft.subjectTemplate,
      bodyHtml: draft.bodyHtml,
      bodyText: draft.bodyText ?? ''
    };

    this.cdr.markForCheck();
  }

  saveDraft(): void {
    const key = this.getDraftKey();

    if (!key || !this.template) {
      return;
    }

    this.stateService.saveState(key, {
      templateName: this.form.templateName,
      subjectTemplate: this.form.subjectTemplate,
      bodyHtml: this.form.bodyHtml,
      bodyText: this.form.bodyText ?? ''
    });
  }

  private discardDraft(): void {
    this.preserveDraftOnDestroy = false;

    const key = this.getDraftKey();

    if (key) {
      this.stateService.clearState(key);
    }
  }

  loadTemplate(): void {

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage = 'Invalid email template ID.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.emailTemplateService.getAllTemplates().subscribe({

      next: (templates) => {

        this.template = templates.find(
          item => item.id === id
        ) ?? null;

        if (!this.template) {
          this.errorMessage = 'Email template not found.';
          return;
        }

        this.form = {
          templateName: this.template.templateName,
          subjectTemplate: this.template.subjectTemplate,
          bodyHtml: this.template.bodyHtml ?? '',
          bodyText: this.template.bodyText ?? ''
        };

        // Restore the saved draft only after loading the latest template.
        this.restoreDraft();

        this.cdr.markForCheck();
      },

      error: () => {
        this.errorMessage = 'Unable to load email template.';
        this.loading = false;
        this.cdr.markForCheck();
      },

      complete: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }

    });
  }

  saveChanges(): void {

    if (!this.template || this.saving) {
      return;
    }

    const request: UpdateEmailTemplateRequest = {
      templateName: this.form.templateName.trim(),
      subjectTemplate: this.form.subjectTemplate.trim(),
      bodyHtml: this.form.bodyHtml,
      bodyText: this.form.bodyText?.trim() || null
    };

    if (
      !request.templateName ||
      !request.subjectTemplate ||
      !request.bodyHtml.trim()
    ) {
      this.errorMessage =
        'Template name, subject and HTML body are required.';

      return;
    }

    this.saving = true;
    this.errorMessage = '';

    this.emailTemplateService.updateTemplate(
      this.template.id,
      request
    ).subscribe({

      next: () => {
        const templateId = this.template!.id;

        this.discardDraft();

        this.router.navigate([
          '/email-templates',
          templateId
        ]);
      },

      error: () => {
        this.errorMessage = 'Unable to save email template changes.';
        this.saving = false;
        this.cdr.markForCheck();
      }

    });
  }

  cancel(): void {

    this.discardDraft();

    if (this.template) {
      this.router.navigate([
        '/email-templates',
        this.template.id
      ]);
    } else {
      this.router.navigate(['/email-templates']);
    }
  }
}

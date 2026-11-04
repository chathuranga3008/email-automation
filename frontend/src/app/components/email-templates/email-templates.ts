import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { EmailTemplateService } from '../../services/email-template.service';
import { EmailTemplate } from '../../models/email-template.model';

@Component({
  selector: 'app-email-templates',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './email-templates.html',
  styleUrl: './email-templates.scss'
})
export class EmailTemplates implements OnInit {

  private emailTemplateService = inject(EmailTemplateService);
  private cdr = inject(ChangeDetectorRef);

  templates: EmailTemplate[] = [];

  loading = false;
  errorMessage = '';
  statusErrorMessage = '';

  updatingTemplateIds = new Set<number>();

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {

    this.loading = true;
    this.errorMessage = '';
    this.statusErrorMessage = '';

    this.emailTemplateService.getAllTemplates().subscribe({

      next: (data) => {
        this.templates = data;
        this.cdr.markForCheck();
      },

      error: () => {
        this.errorMessage = 'Unable to load email templates.';
        this.loading = false;
        this.cdr.markForCheck();
      },

      complete: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }

    });
  }

  setTemplateStatus(template: EmailTemplate): void {

    const newStatus = !template.isActive;

    this.statusErrorMessage = '';

    this.updatingTemplateIds = new Set([
      ...this.updatingTemplateIds,
      template.id
    ]);

    this.emailTemplateService.setTemplateStatus(
      template.id,
      newStatus
    ).subscribe({

      next: () => {

        template.isActive = newStatus;

        this.updatingTemplateIds.delete(template.id);

        this.updatingTemplateIds = new Set(
          this.updatingTemplateIds
        );

        this.cdr.markForCheck();
      },

      error: () => {

        this.statusErrorMessage =
          `Unable to ${newStatus ? 'unhide' : 'hide'} template "${template.templateName}".`;

        this.updatingTemplateIds.delete(template.id);

        this.updatingTemplateIds = new Set(
          this.updatingTemplateIds
        );

        this.cdr.markForCheck();
      }

    });
  }
}

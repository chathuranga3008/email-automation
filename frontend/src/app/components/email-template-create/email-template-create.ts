import {
  Component,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { EmailTemplateService } from '../../services/email-template.service';
import { CreateEmailTemplateRequest } from '../../models/email-template.model';

@Component({
  selector: 'app-email-template-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './email-template-create.html',
  styleUrl: './email-template-create.scss'
})
export class EmailTemplateCreate {

  private emailTemplateService = inject(EmailTemplateService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  templateCode = '';
  templateName = '';
  subjectTemplate = '';
  bodyHtml = '';
  bodyText = '';

  loading = false;
  errorMessage = '';

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

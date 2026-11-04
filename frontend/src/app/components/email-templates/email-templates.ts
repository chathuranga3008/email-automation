import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmailTemplateService } from '../../services/email-template.service';
import { EmailTemplate } from '../../models/email-template.model';
import { RouterLink } from '@angular/router';

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

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading = true;
    this.errorMessage = '';

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
}

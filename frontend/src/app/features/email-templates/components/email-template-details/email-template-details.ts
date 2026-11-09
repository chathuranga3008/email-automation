import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { EmailTemplateService } from '../../services/email-template.service';
import { EmailTemplate } from '../../models/email-template.model';

@Component({
  selector: 'app-email-template-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './email-template-details.html',
  styleUrl: './email-template-details.scss'
})
export class EmailTemplateDetails implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private emailTemplateService = inject(EmailTemplateService);
  private cdr = inject(ChangeDetectorRef);

  template: EmailTemplate | null = null;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadTemplate();
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
        this.template = templates.find(item => item.id === id) ?? null;

        if (!this.template) {
          this.errorMessage = 'Email template not found.';
        }

        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Unable to load email template details.';
        this.loading = false;
        this.cdr.markForCheck();
      },
      complete: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/email-templates']);
  }
}

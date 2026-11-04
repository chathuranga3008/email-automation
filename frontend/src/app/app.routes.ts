import { Routes } from '@angular/router';
import { SectionPage } from './section-page';
import { Dashboard } from './components/dashboard/dashboard';
import { EmailTemplates } from './components/email-templates/email-templates';
import { EmailTemplateCreate } from './components/email-template-create/email-template-create';
import { EmailTemplateDetails } from './components/email-template-details/email-template-details';
import { EmailTemplateEdit } from './components/email-template-edit/email-template-edit';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: Dashboard,
    data: {
      title: 'Dashboard',
      description: 'Overview of your email automation activities.',
    },
  },
  {
    path: 'send-emails',
    component: SectionPage,
    data: {
      title: 'Send Emails',
      description: 'Select records and recipients to send emails.',
    },
  },
  {
    path: 'email-templates',
    component: EmailTemplates,
    data: {
      title: 'Email Templates',
      description: 'Manage your email templates.',
    },
  },
  {
    path: 'email-templates/create',
    component: EmailTemplateCreate,
    data: {
      title: 'Create Email Template',
      description: 'Create a new email template.',
    },
  }, {
    path: 'email-templates/:id/edit',
    component: EmailTemplateEdit,
    data: {
      title: 'Edit Email Template',
      description: 'Edit email template configuration and content.',
    },
  },
  {
    path: 'email-templates/:id',
    component: EmailTemplateDetails,
    data: {
      title: 'Template Details',
      description: 'View email template content and configuration.',
    },
  },
  {
    path: 'email-history',
    component: SectionPage,
    data: {
      title: 'Email History',
      description: 'Review email jobs and delivery history.',
    },
  },
  {
    path: 'recipients',
    component: SectionPage,
    data: {
      title: 'Recipients',
      description: 'View and manage email recipients.',
    },
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

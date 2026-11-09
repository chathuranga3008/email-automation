import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/components/dashboard';
import { SendEmails } from './components/send-emails/send-emails';
import { EmailTemplates } from './features/email-templates/components/email-templates/email-templates';
import { EmailTemplateCreate } from './features/email-templates/components/email-template-create/email-template-create';
import { EmailTemplateDetails } from './features/email-templates/components/email-template-details/email-template-details';
import { EmailTemplateEdit } from './features/email-templates/components/email-template-edit/email-template-edit';
import { EmailHistory } from './components/email-history/email-history';
import { EmailJobDetailsPage } from './components/email-job-details/email-job-details';
import { Recipients } from './components/recipients/recipients';
import { RecipientCreate } from './components/recipient-create/recipient-create';
import { RecipientEdit } from './components/recipient-edit/recipient-edit';
import { Records } from './components/records/records';
import { RecordCreate } from './components/record-create/record-create';
import { RecordEdit } from './components/record-edit/record-edit';

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
    component: SendEmails,
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
    path: 'email-history/:id',
    component: EmailJobDetailsPage,
    data: {
      title: 'Email Job Details',
      description: 'Review email job information and recipient delivery results.',
    },
  },
  {
    path: 'email-history',
    component: EmailHistory,
    data: {
      title: 'Email History',
      description: 'Review email jobs and delivery history.',
    },
  },
  {
    path: 'recipients/create',
    component: RecipientCreate,
    data: {
      title: 'Create Recipient',
      description: 'Add a new email recipient.',
    },
  },
  {
    path: 'recipients/:id/edit',
    component: RecipientEdit,
    data: {
      title: 'Edit Recipient',
      description: 'Update an existing email recipient.',
    },
  },
  {
    path: 'recipients',
    component: Recipients,
    data: {
      title: 'Recipients',
      description: 'View and manage email recipients.',
    },
  },
  {
    path: 'records/create',
    component: RecordCreate,
    data: {
      title: 'Create Record',
      description: 'Add a new record to the system.',
    },
  },
  {
    path: 'records/:id/edit',
    component: RecordEdit,
    data: {
      title: 'Edit Record',
      description: 'Update an existing record.',
    },
  },
  {
    path: 'records',
    component: Records,
    data: {
      title: 'Records',
      description: 'View and manage your records.',
    },
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

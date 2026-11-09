import { TestBed } from '@angular/core/testing';
import { EmailJobService } from './email-job.service';

describe('EmailJobService', () => {
  let service: EmailJobService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmailJobService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

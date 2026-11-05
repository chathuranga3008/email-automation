import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmailJobDetails } from './email-job-details';

describe('EmailJobDetails', () => {
  let component: EmailJobDetails;
  let fixture: ComponentFixture<EmailJobDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailJobDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailJobDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

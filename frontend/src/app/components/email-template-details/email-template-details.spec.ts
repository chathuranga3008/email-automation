import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmailTemplateDetails } from './email-template-details';

describe('EmailTemplateDetails', () => {
  let component: EmailTemplateDetails;
  let fixture: ComponentFixture<EmailTemplateDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailTemplateDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailTemplateDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

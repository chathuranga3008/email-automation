import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmailJobDetailsPage } from './email-job-details';
import { provideRouter } from '@angular/router';

describe('EmailJobDetails', () => {
  let component: EmailJobDetailsPage;
  let fixture: ComponentFixture<EmailJobDetailsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailJobDetailsPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailJobDetailsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

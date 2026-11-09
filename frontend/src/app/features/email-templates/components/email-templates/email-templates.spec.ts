import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmailTemplates } from './email-templates';
import { provideRouter } from '@angular/router';

describe('EmailTemplates', () => {
  let component: EmailTemplates;
  let fixture: ComponentFixture<EmailTemplates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailTemplates],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailTemplates);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

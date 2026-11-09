import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmailTemplateEdit } from './email-template-edit';
import { provideRouter } from '@angular/router';

describe('EmailTemplateEdit', () => {
  let component: EmailTemplateEdit;
  let fixture: ComponentFixture<EmailTemplateEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailTemplateEdit],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailTemplateEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

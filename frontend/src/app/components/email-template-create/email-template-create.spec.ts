import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmailTemplateCreate } from './email-template-create';

describe('EmailTemplateCreate', () => {
  let component: EmailTemplateCreate;
  let fixture: ComponentFixture<EmailTemplateCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailTemplateCreate],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailTemplateCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

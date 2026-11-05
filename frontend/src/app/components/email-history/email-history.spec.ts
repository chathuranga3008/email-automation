import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmailHistory } from './email-history';

describe('EmailHistory', () => {
  let component: EmailHistory;
  let fixture: ComponentFixture<EmailHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailHistory],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

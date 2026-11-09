import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmailHistory } from './email-history';
import { provideRouter } from '@angular/router';

describe('EmailHistory', () => {
  let component: EmailHistory;
  let fixture: ComponentFixture<EmailHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailHistory],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

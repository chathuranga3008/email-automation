import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SendEmails } from './send-emails';
import { provideRouter } from '@angular/router';

describe('SendEmails', () => {
  let component: SendEmails;
  let fixture: ComponentFixture<SendEmails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendEmails],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SendEmails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Recipients } from './recipients';
import { provideRouter } from '@angular/router';

describe('Recipients', () => {
  let component: Recipients;
  let fixture: ComponentFixture<Recipients>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recipients],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Recipients);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

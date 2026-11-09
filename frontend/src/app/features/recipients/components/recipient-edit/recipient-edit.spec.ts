import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipientEdit } from './recipient-edit';
import { provideRouter } from '@angular/router';

describe('RecipientEdit', () => {
  let component: RecipientEdit;
  let fixture: ComponentFixture<RecipientEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipientEdit],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipientEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipientCreate } from './recipient-create';

describe('RecipientCreate', () => {
  let component: RecipientCreate;
  let fixture: ComponentFixture<RecipientCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipientCreate],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipientCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

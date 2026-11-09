import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecordCreate } from './record-create';
import { provideRouter } from '@angular/router';

describe('RecordCreate', () => {
  let component: RecordCreate;
  let fixture: ComponentFixture<RecordCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordCreate],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

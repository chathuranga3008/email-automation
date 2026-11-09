import { TestBed } from '@angular/core/testing';
import { StatePreservationService } from './state-preservation.service';

describe('StatePreservationService', () => {
  let service: StatePreservationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatePreservationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

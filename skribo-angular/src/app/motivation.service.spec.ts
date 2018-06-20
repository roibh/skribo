import { TestBed, inject } from '@angular/core/testing';

import { MotivationService } from './motivation.service';

describe('MotivationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MotivationService]
    });
  });

  it('should be created', inject([MotivationService], (service: MotivationService) => {
    expect(service).toBeTruthy();
  }));
});

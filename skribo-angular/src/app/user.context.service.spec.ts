import { TestBed, inject } from '@angular/core/testing';

import { UserContextService } from './user.context.service';

describe('UserContextService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserContextService]
    });
  });

  it('should be created', inject([UserContextService], (service: UserContextService) => {
    expect(service).toBeTruthy();
  }));
});

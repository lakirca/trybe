import { TestBed } from '@angular/core/testing';

import { EosioService } from './eosio.service';

describe('EosioService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EosioService = TestBed.get(EosioService);
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { ConfigsService } from './configs.service';

describe('ConfigsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConfigsService = TestBed.get(ConfigsService);
    expect(service).toBeTruthy();
  });
});

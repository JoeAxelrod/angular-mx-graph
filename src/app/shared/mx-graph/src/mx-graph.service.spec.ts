import { TestBed, inject } from '@angular/core/testing';

import { MxGraphService } from './mx-graph.service';

describe('MxGraphService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MxGraphService]
    });
  });

  it('should be created', inject([MxGraphService], (service: MxGraphService) => {
    expect(service).toBeTruthy();
  }));
});

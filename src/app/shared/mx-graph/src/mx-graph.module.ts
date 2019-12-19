import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MxGraphService } from './mx-graph.service';

@NgModule({
  imports: [
    CommonModule
  ]
})
export class MxGraphModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MxGraphModule,
      providers: [ MxGraphService ]
    }
  }
}

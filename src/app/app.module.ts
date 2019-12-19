import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MxGraphService } from './shared/mx-graph';
// import { MxGraphModule } from './shared/mx-graph/src/mx-graph.module';



@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    MxGraphService
  ],
  bootstrap: [AppComponent]
})



export class AppModule {

}




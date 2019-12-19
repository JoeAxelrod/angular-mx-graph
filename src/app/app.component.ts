import { Component, OnInit, ViewChild } from '@angular/core';
import { MxGraphService } from './shared/mx-graph';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private someText = 'Some text';
  private graph: any;
  @ViewChild('canvas', {static: true}) canvas;

  constructor(private mxgService: MxGraphService) {

  }

  ngOnInit() {
    // create graph
    this.graph = this.mxgService.createGraph(this.canvas.nativeElement, {
      foldingEnabled: false
    }, '/topology');

    // Enables HTML labels
    this.graph.setHtmlLabels(true);

    this.graph.insertVertex(
      this.graph.getDefaultParent(),
      'some_id',
      `
        <div>
          <span>{{ someText }}</span>
          <span>2</span>
          <span>3</span>
          <span *ngIf="true">4</span>
        </div>
      `,
      0,
      0
    );
  }
}

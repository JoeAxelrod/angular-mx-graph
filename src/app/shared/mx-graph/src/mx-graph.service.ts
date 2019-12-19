import { Injectable } from '@angular/core';

import { Subject, Subscription } from 'rxjs';
import { get } from 'lodash';

import MxGraphAddons from './mx-graph-addons';
import MxgraphShapes from './mx-graph-shapes';
import MxgraphOverrides from './mx-graph-overrides';

declare const window: any;

@Injectable()
export class MxGraphService {
  mxClient = window.mxClient;
  mxLoadResources = window.mxLoadResources;
  mxForceIncludes = window.mxForceIncludes;
  mxUtils = window.mxUtils;
  mxConnectionHandler = window.mxConnectionHandler;
  mxImage = window.mxImage;
  mxDivResizer = window.mxDivResizer;
  mxGraphModel = window.mxGraphModel;
  mxGraph = window.mxGraph;
  mxOutline = window.mxOutline;
  mxKeyHandler = window.mxKeyHandler;
  mxRubberband = window.mxRubberband;
  mxCell = window.mxCell;
  mxEvent = window.mxEvent;
  mxEffects = window.mxEffects;
  mxConstants = window.mxConstants;
  mxPerimeter = window.mxPerimeter;
  mxCodec = window.mxCodec;
  mxCellTracker = window.mxCellTracker;
  mxCylinder = window.mxCylinder;
  mxRectangle = window.mxRectangle;
  mxCellRenderer = window.mxCellRenderer;
  mxActor = window.mxActor;
  mxPoint = window.mxPoint;
  mxGraphHandler = window.mxGraphHandler;
  mxPopupMenu = window.mxPopupMenu;
  mxDragSource = window.mxDragSource;
  mxEventObject = window.mxEventObject;
  mxCellState = window.mxCellState;
  mxShape = window.mxShape;
  mxCellOverlay = window.mxCellOverlay;
  mxText = window.mxText;
  mxVertexHandler = window.mxVertexHandler;
  mxFastOrganicLayout = window.mxFastOrganicLayout;
  mxParallelEdgeLayout = window.mxParallelEdgeLayout;
  mxLayoutManager = window.mxLayoutManager;
  mxStackLayout = window.mxStackLayout;
  mxGraphLayout = window.mxGraphLayout;
  mxCompositeLayout = window.mxCompositeLayout;
  mxCellHighlight = window.mxCellHighlight;
  mxGeometryChange = window.mxGeometryChange;
  mxConstraintHandler = window.mxConstraintHandler;
  mxEdgeHandler = window.mxEdgeHandler;
  mxConnectionConstraint = window.mxConnectionConstraint;
  mxGuide = window.mxGuide;
  mxGeometry = window.mxGeometry;
  mxEdgeStyle = window.mxEdgeStyle;
  mxRectangleShape = window.mxRectangleShape;
  mxClipboard = window.mxClipboard;
  mxArrow = window.mxArrow;
  mxStyleRegistry = window.mxStyleRegistry;
  mxGraphSelectionModel = window.mxGraphSelectionModel;
  mxTooltipHandler = window.mxTooltipHandler;

  // cell currently being dragged
  draggedCell: any;

  data: any = {
    addNodeOnClick: null,
    addNodeOnDrop: null
  };

  private subscriptions = new Subscription();
  distributeCellListener = new Subject();
  alignCellsListener = new Subject();
  rotateCellsListener = new Subject();
  flipCellsListener = new Subject();
  mouseMoveEvent$ = new Subject();
  dragEnterEvent$ = new Subject();
  dragOverEvent$ = new Subject();
  dragLeaveEvent$ = new Subject();
  private mouseMoveEventOrigin$ = new Subject();
  mouseDownEventOrigin$ = new Subject();

  private graphReference;
  graphs: any = {};
  // used for edge count
  count: number;

  // entities store (currently cables only and sites partially)
  entities = {};
  selectedColor = '#7ce7fe';
  customSelectionStyle = {
    strokeColor: this.selectedColor,
    strokeWidth: 2
  };


  constructor() {
    MxgraphShapes.addMultilineShapes(this);
    MxgraphOverrides.popupMenuAddItem(this);
    MxgraphOverrides.popupMenu(this);
    MxgraphOverrides.hideMenu(this);
    MxgraphOverrides.addSeparator(this);
    MxgraphOverrides.overrideInsertFunctions(this);
    MxgraphOverrides.isToggleEvent(this);

    this.count = 0;
    MxgraphOverrides.modifyParallelOverlay(this);
    MxGraphAddons.distibuteCells(this);
    MxGraphAddons.addCustomEdgeStyle(this);
    MxgraphOverrides.createSelectionShape(this);
  }

  // https://jgraph.github.io/mxgraph/docs/js-api/files/util/mxConstants-js.html#mxConstants
  renderStyleValue(styleObj) {
    return (Object as any).entries(styleObj).map(i => i.join('=')).join(';');
  }

  // TODO: create interface
  buildImageLabelStyle(data) {
    const defaults = {
      shape: this.mxConstants.SHAPE_LABEL,
      perimeter: this.mxPerimeter.RectanglePerimeter,
      fillColor: '#50678D',
      fontColor: 'rgba(255, 255, 255, 0.7)',
      align: this.mxConstants.ALIGN_CENTER,
      verticalAlign: this.mxConstants.ALIGN_TOP,
      imageAlign: this.mxConstants.ALIGN_CENTER,
      imageVerticalAlign: this.mxConstants.ALIGN_CENTER,
      verticalLabelPosition: this.mxConstants.ALIGN_BOTTOM,
      strokeColor: 'none',
      imageWidth: 40,
      imageHeight: 40,
      image: null,
      spasing: 8,
      spacingTop: 2,
      fontSize: 12,
      whiteSpace: 'wrap'
    };
    return {...defaults, ...data};
  }

  buildLabelStyle(data) {
    const defaults = {
      shape: this.mxConstants.SHAPE_LABEL,
      perimeter: this.mxPerimeter.RectanglePerimeter,
      fillColor: '#eaeef0',
     // fontColor: '#104e68',
      fontColor: 'rgba(255, 255, 255, 0.9)',
      align: this.mxConstants.ALIGN_CENTER,
      verticalAlign: this.mxConstants.ALIGN_TOP,
      imageAlign: this.mxConstants.ALIGN_CENTER,
      imageVerticalAlign: this.mxConstants.ALIGN_CENTER,
      verticalLabelPosition: this.mxConstants.ALIGN_BOTTOM,
      strokeColor: 'none',
      imageWidth: 40,
      imageHeight: 40,
      //   image: null,
      spasing: 8,
      spacingTop: 2,
      fontSize: 12,
      whiteSpace: 'wrap'
    };
    return {...defaults, ...data};
  }

  buildOpticalElementLabelStyle(data) {
    const defaults = {
      shape: this.mxConstants.SHAPE_LABEL,
      perimeter: this.mxPerimeter.RectanglePerimeter,
    //  perimeter: this.mxConstants.PERIMETER_ELLIPSE,
      // fillColor: '#000000',
      fontColor: 'rgba(255, 255, 255, 0.7)',
      align: this.mxConstants.ALIGN_CENTER,
      verticalAlign: this.mxConstants.ALIGN_TOP,
      imageAlign: this.mxConstants.ALIGN_CENTER,
      imageVerticalAlign: this.mxConstants.ALIGN_CENTER,
      verticalLabelPosition: null,
      strokeColor: 'none',
      imageWidth: null,
      imageHeight: null,
      // image: null,
      spasing: 8,
      spacingTop: 2,
      fontSize: 12,
      whiteSpace: 'wrap'
    };
    return {...defaults, ...data};
  }

  zoomActual(zoomOnly = false, padding = 0) {
    const graph = this.getGraph(true);
    if (graph) {
      graph.zoomActual();
      if (!zoomOnly) {
        this.fitAndCenterGraph(graph, padding);
      }
    }
  }

  // TODO: support multiple graphs
  setGraph(graph, key?) {
    // MX graph mouse listener
    graph.addMouseListener({
      mouseDown: (sender, evt) => {
        evt.state && evt.state.cell && !evt.state.cell.edge && (this.draggedCell = evt.state.cell);
        this.mouseDownEventOrigin$.next(evt);
      },
      mouseMove: (sender, evt) => this.mouseMoveEventOrigin$.next({sender, evt}),
      mouseUp: _ => this.draggedCell && (this.draggedCell = undefined),
      dragEnter: (evt, cell) => this.dragEnterEvent$.next({evt, cell}),
      dragOver: (evt, cell) => this.dragOverEvent$.next({evt, cell}),
      dragLeave: (evt, cell) => this.dragLeaveEvent$.next({evt, cell})
    });

    this.graphReference = graph;
    key = key || 'test_123';
    const zoomTouched = get(this, `graphs[${key}].graph.zoomTouched`);
    this.graphs[key] = {graph, selectedMap: {}, savedScale: get(this, `graphs[${key}].savedScale`)};
    if (zoomTouched) {
      this.graphs[key].graph.zoomTouched = true;
    }
  }

  getGraph(byUrl = false) {
    return this.graphReference;
  }

  fitCanvasToParent(graph?) {
    graph = graph || this.getGraph();

    if (graph) {
      const w = graph.container.parentElement.clientWidth;
      const h = graph.container.parentElement.clientHeight;

      if (graph.container.parentElement.clientHeight !== graph.container.clientHeight) {
        graph.doResizeContainer(w, h);
      }
    }
  }

  fitAndCenterGraph(graph?, padding?) {
    graph = graph || this.getGraph();
    padding = padding || 0;
    if (graph) {
      this.fitCanvasToParent(graph);

      const bounds = graph.getGraphBounds();
      if (bounds.width && bounds.height) {
        const cw = graph.container.clientWidth;
        const ch = graph.container.clientHeight;
        const w = bounds.width / graph.view.scale + padding;
        const h = bounds.height / graph.view.scale + padding;
        const s = Math.min(1, Math.min(cw / w, ch / h));

        graph.view.scaleAndTranslate(
          s,
          (cw - w * s) / (2 * s) - bounds.x / graph.view.scale + (padding / 2),
          (ch - h * s) / (2 * s) - bounds.y / graph.view.scale
        );
      }
    }
  }

  fitToArea(graph = this.getGraph(true), cw?, ch?, margin?, backToDefaultScale = false) {
    margin = margin === 'null' || typeof margin === 'undefined' ? 12 : margin;
    if (graph) {
      const maxScale = 2;
      const bounds = graph.getGraphBounds();
      
      cw = (cw < 0 ? graph.container.clientWidth + cw : cw || graph.container.clientWidth) - margin;
      ch = (ch || graph.container.clientHeight) - margin;

      const w = Math.round((bounds.width / graph.view.scale) * 10) / 10;
      const h = Math.round((bounds.height / graph.view.scale) * 10) / 10;
  
      // const rescaleNeeded = bounds.width > cw || bounds.height > ch;
      const newScale = /*rescaleNeeded &&*/ backToDefaultScale ? 1 : Math.min(maxScale, Math.min(cw / w, ch / h));
      
      graph.view.scaleAndTranslate(
        newScale,
        -(bounds.x / graph.view.scale - graph.view.translate.x - (margin + cw - w * newScale) / (2 * newScale)),
        -(bounds.y / graph.view.scale - graph.view.translate.y - (margin + ch - h * newScale) / (2 * newScale))
      );
    }
  }

  /**
   *
   * @param cells - array of mxCell's or mxCell object
   * @param cw - (optional) visible area width, if negative this value will be subtracted from the current canvas width
   * @param graph (optional)
   */
  isInVisibleArea(cells, cw = 0, graph = this.getGraph(true)): boolean {
    if (!cells || cells.length === 0) { return false; } // no cell, or empty array
    if (cells && !cells.length) { cells = [cells]; } // reformat cell object to array cells
    if (graph) {
      for (const idx in cells) {
        const cell = cells[idx];
        const cellInArea = (
          // check horizontal
          (graph.view.translate.x * graph.view.scale + cell.geometry.x) > 0 // If greater than 0 - the element is left to the canvas
          &&
          (graph.view.translate.x * graph.view.scale + cell.geometry.x) < graph.container.clientWidth - cw // If greater than clientWidth - the element is right to the canvas
        )
        &&  (
          // check vertical
          (graph.view.translate.y * graph.view.scale + cell.geometry.y) > 0
          &&
          (graph.view.translate.y * graph.view.scale + cell.geometry.y) < graph.container.clientHeight
        );
        if (!cellInArea) { return false; } // one of the cells is not in the visible area
      }
    }
    return true; // no one of the cells is out of the visible area
  }

  /**
   * @param cells - array of mxCell's or mxCell object
   * @param cw - (optional) visible area width, if negative this value will be subtracted from the current canvas width
   * @param ch - (optional) visible area heights, if negative this value will be subtracted from the current canvas height
   * @param margin
   * @param graph (optional)
   */
  panToArea(cells: any[] = [], cw?, ch?, margin = 60, graph = this.getGraph(true)) {
    if (cells && !cells.length) {
      cells = [cells];
    }
    if (graph && cells.length) {
      const bounds = graph.view.getBounds(cells);
      if (!bounds) {
        console.warn('Warning - no bounds');
        return;
      }

      cw = (cw < 0 ? graph.container.clientWidth + cw : cw || graph.container.clientWidth) - margin;
      ch = (cw < 0 ? graph.container.clientHeight + ch : ch || graph.container.clientHeight) - margin;

      const rescaleNeeded = bounds.width > cw || bounds.height > ch;
      let newScale = graph.view.scale;

      const w = Math.round((bounds.width / graph.view.scale) * 10) / 10;
      const h = Math.round((bounds.height / graph.view.scale) * 10) / 10;

      if (!rescaleNeeded) {
        graph.view.setTranslate(
          -(bounds.x / newScale - graph.view.translate.x - (margin + cw - w * newScale) / (2 * newScale)),
          -(bounds.y / newScale - graph.view.translate.y - (margin + ch - h * newScale) / (2 * newScale))
        );
      }
      else {
        newScale = Math.min(cw / w, ch / h);
        graph.view.scaleAndTranslate(
          newScale,
          -(bounds.x / graph.view.scale - graph.view.translate.x - (margin + cw - w * newScale) / (2 * newScale)),
          -(bounds.y / graph.view.scale - graph.view.translate.y - (margin + ch - h * newScale) / (2 * newScale))
        );
      }
    }
  }

  minimize(graph?) {
    graph = graph || this.getGraph();
    const s = 0.2;
    if (graph) {
      const scale = graph.view.scale;
      graph.view.setScale(1);
      const marginLeft = 100;
      const parent = graph.getDefaultParent();
      const bounds = graph.getGraphBounds();
      const cw = graph.container.clientWidth;
      const ch = graph.container.clientHeight;
      const w = bounds.width / graph.view.scale;
      const h = bounds.height / graph.view.scale;

      graph.view.scaleAndTranslate(s, -bounds.x + marginLeft, (ch - h * s) / (2 * s) - bounds.y / graph.view.scale);
    }
  };

  maximize(graph?) {
    graph = graph || this.getGraph();

    if (graph) {
      const margin = 70;
      const h = graph.container.clientHeight + margin * 2;
      graph.view.scaleAndTranslate(1, 0, 0);

      this.fitCanvasToParent();
    }
  };

  centerGraph(graph?) {
    graph = graph || this.getGraph();

    if (graph) {
      const margin = 70;
      const bounds = graph.getGraphBounds();
      const cw = graph.container.clientWidth - margin;
      const w = bounds.width / graph.view.scale;
      const s = bounds.width + margin > cw ? Math.min(5, cw / w) : 5;
      graph.view.scaleAndTranslate(s, (margin + cw - w * s) / (2 * s) - bounds.x / graph.view.scale);
    }
  }

  fitGraph(graph?) {
    graph = graph || this.getGraph();

    if (graph) {
      graph.fit();
      graph.view.rendering = true;
      graph.refresh();
    }
  }

  createGraph(nativeElement, config: any = {}, key?) {
    config = {
      allowHtml: true,
      disableContextMenu: true,
      foldingEnabled: true,
      setCellsSelectable: true,
      setCellsMovable: true,
      setCellsResizable: false,
      setEdgesMovable: false,
      ...config
    };
    // Creates the model and the graph inside the container
    // using the fastest rendering available on the browser
    const model = new this.mxGraphModel();
    const graph = new this.mxGraph(nativeElement, model);

    new this.mxRubberband(graph);

    graph.setCellsCloneable(false);
    graph.setGridEnabled(false);

    graph.setCellsResizable(config.setCellsResizable);
    graph.setPanning(true);
    graph.setCellsSelectable(config.setCellsSelectable);
    graph.setCellsMovable(config.setCellsMovable);

    // disable editing
    graph.setCellsEditable(false);
    graph.foldingEnabled = config.foldingEnabled;
    if (!config.foldingEnabled) {
      this.mxGraph.prototype.getFoldingImage = () => null;
    }

    // allow HTML within cells
    if (config.allowHtml) {
      graph.isHtmlLabel = _ => true;
    }

    // Disables built-in context menu
    if (config.disableContextMenu) {
      this.mxEvent.disableContextMenu(nativeElement);
    }

    // do not allow moving edges
    if (!config.setEdgesMovable) {
      graph.isCellMovable = cell => !cell.edge;
    }

    graph.panningHandler.addListener(this.mxEvent.PAN_START, function () {
      graph.container.style.cursor = 'pointer';
    });
    graph.panningHandler.addListener(this.mxEvent.PAN_END, function () {
      graph.container.style.cursor = 'default';
    });

    // cell spacing for highLighted border
    this.mxCellHighlight.prototype.spacing = 0;

    this.updateGraphScale(graph);

    this.mxConstants.VERTEX_SELECTION_COLOR = this.selectedColor;
    this.mxConstants.VERTEX_SELECTION_DASHED = false;
    this.mxConstants.VERTEX_SELECTION_STROKEWIDTH = 2;
    this.mxConstants.HIGHLIGHT_STROKEWIDTH = 2;
    this.mxConstants.EDGE_SELECTION_COLOR = 'none';//'this.selectedColor;
    this.mxConstants.EDGE_SELECTION_DASHED = false;
    this.mxConstants.STYLE_STROKEWIDTH = 2;
    this.mxConstants.CONNECT_HANDLE_FILLCOLOR = 'none';
    this.mxConstants.HANDLE_STROKECOLOR = 'none';
    this.mxConstants.HANDLE_FILLCOLOR = 'none';
    graph.tooltipHandler.delay = 0;

    const style = graph.getStylesheet().getDefaultEdgeStyle();
    style[this.mxConstants.STYLE_STROKEWIDTH] = 2;
    style[this.mxConstants.STYLE_STROKECOLOR] = '#E4F1F9';

    // outline
    this.mxConstants.OUTLINE_COLOR = this.selectedColor;

    delete this.mxConstants.CURSOR_MOVABLE_VERTEX;
    delete this.mxConstants.CURSOR_MOVABLE_EDGE;

    graph.getSelectionModel().addListener(this.mxEvent.CHANGE, (sender, evt) => {
      (evt.properties.removed || []).forEach((cell: any) => {
        if (cell) {
          // move selection shape under overlay
          const overlays = [...(cell.overlays || [])];
          sender.graph.removeCellOverlays(cell);
          overlays.forEach(o => sender.graph.addCellOverlay(cell, o));

          // set custom selection
          if (cell.edge && !cell.customSelectionStyle) {
            if (cell.highlightPath){
              cell.styleBeforeSelection = cell.style;
            }

            cell.setStyle(this.styleAdd(this.customSelectionStyle, cell.getStyle()));

            if (cell.highlightPath){
              cell.style += ';shape=highlightSelected;';
            }

            this.refreshCell(cell, sender.graph);
          }
        }
      });
      (evt.properties.added || []).forEach((cell: any) => {
        if (cell && cell.edge) {
          if (cell.highlightPath && cell.styleBeforeSelection){
            // remove custom selection
            cell.setStyle(cell.styleBeforeSelection);
          }
          else {
            // remove custom selection
            cell.setStyle(this.styleRemove(Object.keys(this.customSelectionStyle), cell.getStyle()));
          }
          this.refreshCell(cell, sender.graph);
        }
      });
    });

    this.setGraph(graph, key);

    return graph;
  }


  genId(type, id) {
    return `MX_${type}_${id.id || id}`;
  }

  genOMId(type, smId, omId) {
    return `MX_${type}_${smId.id || smId}_${omId.id || omId}`;
  }

  parseId(idValue: string) {
    const [_, type, id, omId] = String(idValue).split('_');
    return type && (id || id === '0') ?
      omId ? {type, id: parseInt(id), omId: parseInt(omId)} : {type, id: type === 'sites' && id.includes('-') ? id :parseInt(id)}
      : null;
  }

  parseFiberId(idValue: string) {
    const [_, type, ids] = idValue.split('_');
    const [id1, id2] = (ids||'').split('-');
    return type ? {id1: parseInt(id1), id2: parseInt(id2)} : null;
  }

  getEquipmentId(genId) {
    return genId.split('_')[2];
  }

  getEquipmentTypes(genId) {
    return genId.split('_')[1];
  }

  selectCells(cellArray: any[], graph?) {
    graph = graph || this.getGraph();

    // make sure not to selct cells twice
    const selectionMap = graph.getSelectionCells().reduce((res, cell) => ({
      ...res,
      [cell.id]: cell.id
    }), {});
    const cellsToSelect = (cellArray || []).filter(cell => cell && !(cell.id in selectionMap));

    if (cellsToSelect.length) {
      graph.setSelectionCells(cellsToSelect);
    }
  }

  setToExistingSelectionCells(cellArray: any[], graph?) {
    graph = graph || this.getGraph();

    // make sure not to select cells twice
    const selectionMap = graph.getSelectionCells();
    const cellsToSelect = selectionMap.concat(cellArray).filter(cell => cell && !cell.edge);

    if (cellsToSelect.length) {
      graph.setSelectionCells(cellsToSelect);
    }
  }

  clearSelection(graph?) {
    graph = graph || this.getGraph();
    graph.clearSelection();
  }

  refreshCell(cell, graph?: any) {
    graph = graph || this.getGraph();
    graph.getView().clear(cell, false, false);
    graph.getView().validate();
  }

  styleEncode(styleMap: { [key: string]: any }): string {
    return Object.entries(styleMap).filter(([key, val]) => key && val).map(([key, val]) => `${key}=${val}`).join(';');
  }

  styleDecode(style: string) {
    return (style || '').split(';').reduce((res, curr) => {
      const [key, val] = curr.split('=');
      return {
        ...res,
        [key]: val
      };
    }, {});
  }

  styleAdd(styleMap: { [key: string]: any }, existingStyle: string): string {
    return this.styleEncode({
      ...this.styleDecode(existingStyle),
      ...styleMap
    });
  }

  styleRemove(styleKeys: string[], existingStyle: string): string {
    const existingStyleMap = this.styleDecode(existingStyle);
    styleKeys.forEach(styleKey => delete existingStyleMap[styleKey]);
    return this.styleEncode(existingStyleMap);
  }

  getPortImageStyle() {
    const bdirectionPortImageStyle = this.renderStyleValue(this.buildImageLabelStyle({
      image: '/network-planning-assets/svgs/bdirection-port.svg',
      fillColor: 'none',
      rounded: 1,
      imageWidth: 8,
      imageHeight: 9,
    }));

    const outputPortImageStyle = this.renderStyleValue(this.buildImageLabelStyle({
      image: '/network-planning-assets/svgs/output-port.svg',
      fillColor: 'none',
      rounded: 1,
      imageWidth: 8,
      imageHeight: 8,
    }));

    const inputRightPortImageStyle = this.renderStyleValue(this.buildImageLabelStyle({
      image: '/network-planning-assets/svgs/input-port-right.svg',
      fillColor: 'none',
      rounded: 1,
      imageWidth: 8,
      imageHeight: 11,
    }));

    const inputUpPortImageStyle = this.renderStyleValue(this.buildImageLabelStyle({
      image: '/network-planning-assets/svgs/input-port-up.svg',
      fillColor: 'none',
      rounded: 1,
      imageWidth: 11,
      imageHeight: 8,
    }));

    const inputLeftPortImageStyle = this.renderStyleValue(this.buildImageLabelStyle({
      image: '/network-planning-assets/svgs/input-port-left.svg',
      fillColor: 'none',
      rounded: 1,
      imageWidth: 8,
      imageHeight: 11,
    }));

    const inputDownPortImageStyle = this.renderStyleValue(this.buildImageLabelStyle({
      image: '/network-planning-assets/svgs/input-port-down.svg',
      fillColor: 'none',
      rounded: 1,
      imageWidth: 11,
      imageHeight: 8,
    }));

    const bdirectionHighlightPortImageStyle = this.renderStyleValue(this.buildImageLabelStyle({
      image: '/network-planning-assets/svgs/bdirection-port-highlight.svg',
      fillColor: 'none',
      rounded: 1,
      imageWidth: 8,
      imageHeight: 9,
    }));

    const outputHighlightPortImageStyle = this.renderStyleValue(this.buildImageLabelStyle({
      image: '/network-planning-assets/svgs/output-port-highlight.svg',
      fillColor: 'none',
      rounded: 1,
      imageWidth: 8,
      imageHeight: 8,
    }));

    const inputRightHighlightPortImageStyle = this.renderStyleValue(this.buildImageLabelStyle({
      image: '/network-planning-assets/svgs/input-port-right-highlight.svg',
      fillColor: 'none',
      rounded: 1,
      imageWidth: 8,
      imageHeight: 11,
    }));

    const inputUpHighlightPortImageStyle = this.renderStyleValue(this.buildImageLabelStyle({
      image: '/network-planning-assets/svgs/input-port-up-highlight.svg',
      fillColor: 'none',
      rounded: 1,
      imageWidth: 11,
      imageHeight: 8,
    }));

    const inputLeftHighlightPortImageStyle = this.renderStyleValue(this.buildImageLabelStyle({
      image: '/network-planning-assets/svgs/input-port-left-highlight.svg',
      fillColor: 'none',
      rounded: 1,
      imageWidth: 8,
      imageHeight: 11,
    }));

    const inputDownHighlightPortImageStyle = this.renderStyleValue(this.buildImageLabelStyle({
      image: '/network-planning-assets/svgs/input-port-down-highlight.svg',
      fillColor: 'none',
      rounded: 1,
      imageWidth: 11,
      imageHeight: 8,
    }));

    return {
      bdirectionPortImageStyle,
      outputPortImageStyle,
      inputRightPortImageStyle,
      inputLeftPortImageStyle,
      inputUpPortImageStyle,
      inputDownPortImageStyle,
      bdirectionHighlightPortImageStyle,
      outputHighlightPortImageStyle,
      inputRightHighlightPortImageStyle,
      inputLeftHighlightPortImageStyle,
      inputUpHighlightPortImageStyle,
      inputDownHighlightPortImageStyle
    }
  }

  updateGraphScale(graph: any) {
  
  }
}

export default class MxgraphShapes {
  static registerShapes(service) {
    // DataStore Shape, supports size style
    function DataStoreShape() {
      service.mxCylinder.call(this);
    }

    service.mxUtils.extend(DataStoreShape, service.mxCylinder);

    DataStoreShape.prototype.redrawPath = function (c, x, y, w, h, isForeground) {
      const dy = Math.min(h / 2, Math.round(h / 8) + this.strokewidth - 1);

      if ((isForeground && this.fill != null) || (!isForeground && this.fill == null)) {
        c.moveTo(0, dy);
        c.curveTo(0, 2 * dy, w, 2 * dy, w, dy);

        // Needs separate shapes for correct hit-detection
        if (!isForeground) {
          c.stroke();
          c.begin();
        }
        
        c.translate(0, dy / 2);
        c.moveTo(0, dy);
        c.curveTo(0, 2 * dy, w, 2 * dy, w, dy);

        // Needs separate shapes for correct hit-detection
        if (!isForeground) {
          c.stroke();
          c.begin();
        }

        c.translate(0, dy / 2);
        c.moveTo(0, dy);
        c.curveTo(0, 2 * dy, w, 2 * dy, w, dy);

        // Needs separate shapes for correct hit-detection
        if (!isForeground) {
          c.stroke();
          c.begin();
        }
        c.translate(0, -dy);
      }

      if (!isForeground) {
        c.moveTo(0, dy);
        c.curveTo(0, -dy / 3, w, -dy / 3, w, dy);
        c.lineTo(w, h - dy);
        c.curveTo(w, h + dy / 3, 0, h + dy / 3, 0, h - dy);
        c.close();
      }
    };
    DataStoreShape.prototype.getLabelMargins = function (rect) {
      return new service.mxRectangle(0, 2.5 * Math.min(rect.height / 2, Math.round(rect.height / 8) +
        this.strokewidth - 1) * this.scale, 0, 0);
    };

    service.mxCellRenderer.registerShape('datastore', DataStoreShape);

    // Delay
    function DelayShape() {
      service.mxActor.call(this);
    }

    service.mxUtils.extend(DelayShape, service.mxActor);
    DelayShape.prototype.redrawPath = function (c, x, y, w, h) {
      const dx = Math.min(w, h / 2);
      c.moveTo(0, 0);
      c.lineTo(w - dx, 0);
      c.quadTo(w, 0, w, h / 2);
      c.quadTo(w, h, w - dx, h);
      c.lineTo(0, h);
      c.close();
      c.end();
    };

    service.mxCellRenderer.registerShape('delay', DelayShape);

    // HTML shape
    function HtmlShape() {
      service.mxShape.call(this);
    }

    service.mxUtils.extend(HtmlShape, service.mxShape);

    HtmlShape.prototype.dialect = service.mxConstants.DIALECT_PREFERHTML;

    HtmlShape.prototype.isHtmlAllowed = function () {
      console.log('IS HTML ALL');
      return true;
    };
    HtmlShape.prototype.createHtml = _ => {
      console.log('HtmlShape');
      const div = document.createElement('DIV');
      const t = document.createTextNode('This is a DIV.');
      div.appendChild(t);
      return div;
    };

    service.mxCellRenderer.registerShape('htmlShape', HtmlShape);
  }

  static addMultilineShapes(service) {
    const line = (c: any, d: any, offset: number, color: string) => {
      const from: any = {...d.pst};
      const to: any = {...d.pen};
      const xy = d.horizontal ? 'y' : 'x';
      from[xy] += d.gapOffset * offset;
      to[xy] += d.gapOffset * offset;
      c.begin();
      c.moveTo(from.x, from.y);
      c.setStrokeColor(color);
      c.lineTo(to.x, to.y);
      c.stroke();
    };


    const getData = (pts: any) => {
      const gap = 2;
      const p0 = pts.length === 4 ? pts[1] : pts[0];
      const pe = pts.length === 4 ? pts[pts.length - 2] : pts[pts.length - 1];

      const adjacent = Math.abs(pe.x - p0.x);
      const opposite = Math.abs(pe.y - p0.y);
      const horizontal = opposite < adjacent;

      const dist = Math.sqrt(adjacent ** 2 + opposite ** 2);
      const cellSize = 50;

      let gapOffset;
      let centerOffset;
      let pst;
      let pen;

      if (horizontal) {
        gapOffset = (dist * gap) / adjacent;
        centerOffset = ((cellSize / 2) * opposite) / adjacent;
        centerOffset = 0;

        pst = {
          x: p0.x,
        //  y: Math.round(p0.y + centerOffset * (p0.y > pe.y ? 1 : -1))
          y: p0.y
        };
        pen = {
          x: pe.x,
        //  y: Math.round(pe.y + centerOffset * (p0.y > pe.y ? -1 : 1))
          y: pe.y
        };
      }
      else {
        gapOffset = (dist * gap) / opposite;
        centerOffset = ((cellSize / 2) * adjacent) / opposite;
        centerOffset = 0;

        pst = {
          x: p0.x,
         // x: Math.round(p0.x + centerOffset * (p0.x > pe.x ? 1 : -1)),
          y: p0.y
        };
        pen = {
          x: pe.x,
        //  x: Math.round(pe.x + centerOffset * (p0.x > pe.x ? -1 : 1)),
          y: pe.y
        };
      }

      return {
        pst,
        pen,
        horizontal,
        gapOffset
      };
    };

    // Define the constructor of the new shape
    function OtdrSelected() {
      service.mxArrow.call(this);
    }

    // Use mxUtils.extend
    service.mxUtils.extend(OtdrSelected, service.mxArrow);
    OtdrSelected.prototype.paintEdgeShape = function (context, points) {
      for (let i = 0; i + 1 < points.length; i++) {
        const currentPoints = [points[i], points[i + 1]];
        const data = getData(currentPoints);
        line(context, data, -1, '#7ce7fe');
        line(context, data, 0, '#006FFF');
        line(context, data, 1, '#7ce7fe');
      }
    };

    function HighlightSelected() {
      service.mxArrow.call(this);
    }

    // Use mxUtils.extend
    service.mxUtils.extend(HighlightSelected, service.mxArrow);
    HighlightSelected.prototype.paintEdgeShape = function (context, points) {
      for (let i = 0; i + 1 < points.length; i++) {
        const currentPoints = [points[i], points[i + 1]];
        const data = getData(currentPoints);
        line(context, data, -1, '#7ce7fe');
        line(context, data, 0, '#6AC8FE');
        line(context, data, 1, '#7ce7fe');
      }
    };

    // Registers the link shape
    service.mxCellRenderer.registerShape('highlightSelected', HighlightSelected);
    service.mxCellRenderer.registerShape('otdrSelected', OtdrSelected);

    const obj: any = {};
    // create phase styles
    service.phaseIndicatorService.getPhaseColors().forEach((color: string, index) => {
      const colorName = color.replace('#', '');
      const keyRegular = `regularWithPhase_${colorName}`;
      const keyRegularSelected = `regularWithPhaseSelected_${colorName}`;
      const keyOtdr = `otdrWithPhase_${colorName}`;
      const keyOtdrSelected = `otdrWithPhaseSelected_${colorName}`;

      [keyRegular, keyRegularSelected, keyOtdr, keyOtdrSelected].forEach(key => {
        obj[key] = function () {
          service.mxArrow.call(this);
        };
        service.mxUtils.extend(obj[key], service.mxArrow);
        obj[key].prototype.paintEdgeShape = function (c, pts) {
          const d = getData(pts);

          key === keyOtdrSelected && line(c, d, -1, '#7ce7fe');
          line(c, d, 0, key === keyRegularSelected ? '#7ce7fe' : (key === keyRegular ? '#E4F1F9' : '#006FFF'));
          line(c, d, 1, color);
          key === keyOtdrSelected && line(c, d, 2, '#7ce7fe');
        };
        // Registers the link shape
        service.mxCellRenderer.registerShape(key, obj[key]);
      });
    });
  }
}

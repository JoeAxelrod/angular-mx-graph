export default class MxGraphAddons {

  static distibuteCells(service) {
    service.mxGraph.prototype.distributeCells = function (horizontal, cells) {
      if (cells == null) {
        cells = this.getSelectionCells();
      }

      if (cells && cells.length > 1) {
        const vertices = [];
        let max = null;
        let min = null;

        cells.forEach(cell => {
          if (this.getModel().isVertex(cell)) {
            const state = this.view.getState(cell);

            if (state != null) {
              const tmp = horizontal ? state.getCenterX() : state.getCenterY();
              max = max != null ? Math.max(max, tmp) : tmp;
              min = min != null ? Math.min(min, tmp) : tmp;

              vertices.push(state);
            }
          }
        });

        if (vertices.length > 2) {
          vertices.sort((a: any, b: any) => horizontal ? a.x - b.x : a.y - b.y);

          const t = this.view.translate;
          const s = this.view.scale;

          min = min / s - (horizontal ? t.x : t.y);
          max = max / s - (horizontal ? t.x : t.y);

          this.getModel().beginUpdate();
          try {
            const dt = (max - min) / (vertices.length - 1);
            let t0 = min;

            for (let i = 1 ; i < vertices.length - 1 ; i++) {
              const pstate = this.view.getState(this.model.getParent(vertices[i].cell));
              let geo = this.getCellGeometry(vertices[i].cell);
              t0 += dt;

              if (geo != null && pstate != null) {
                geo = geo.clone();

                if (horizontal) {
                  geo.x = Math.round(t0 - geo.width / 2) - pstate.origin.x;
                }
                else {
                  geo.y = Math.round(t0 - geo.height / 2) - pstate.origin.y;
                }

                this.getModel().setGeometry(vertices[i].cell, geo);
              }
            }
          }
          finally {
            this.getModel().endUpdate();
          }
        }
      }

      return cells;
    };
  }

  static addCustomEdgeStyle(service) {
    service.mxEdgeStyle.CustomEntityRelation = function (state, source, target, points, result) {
      const view = state.view;
      const graph = view.graph;
      const segment = 0 * view.scale;
      const segmentStep = 5 * view.scale;
      const targetPos = target.cell.placement;
      const sourcePos = source.cell.placement;

      const pts = state.absolutePoints;
      const p0 = pts[0];
      const pe = pts[pts.length - 1];

      let isSourceLeft = false;
      let isTargetLeft = true;

      // both target and source ports are located on NORTH or SOUTH size
      if (['north', 'south'].includes(targetPos) && ['north', 'south'].includes(sourcePos)) {
        if (p0 !== null) {
          source = new service.mxCellState();
          source.x = p0.x;
          source.y = p0.y;
        }
        else if (source !== null) {
          isSourceLeft = isLeftTop(source, target, state, graph);
        }
        else {
          return;
        }

        if (pe !== null) {
          target = new service.mxCellState();
          target.x = pe.x;
          target.y = pe.y;
        }
        else if (target !== null) {
          isTargetLeft = isLeftTop(target, source, state, graph);
        }

        if (source !== null && target !== null) {
          // update order values if necessary
          source.cell.order === undefined && (source.cell.parent.children = addOrder(source.cell.parent.children, sourcePos));
          target.cell.order === undefined && (target.cell.parent.children = addOrder(target.cell.parent.children, targetPos));

          const sourceSegment = segment + segmentStep * source.cell.order;
          const targetSegment = segment + segmentStep * target.cell.order;

          const x0 = view.getRoutingCenterX(source);
          const y0 = isSourceLeft ? source.y : source.y + source.height;

          const xe = view.getRoutingCenterX(target);
          const ye = isTargetLeft ? target.y : target.y + target.height;

          let dy = sourceSegment * (isSourceLeft ? -1 : 1);
          const dep = new service.mxPoint(x0, y0 + dy);

          dy = targetSegment * (isTargetLeft ? -1 : 1);
          const arr = new service.mxPoint(xe, ye + dy);

          // // Adds intermediate points if both go out on same side
          // if (isSourceLeft === isTargetLeft) {
          //   const sy = isSourceLeft ? Math.min(y0, ye) - sourceSegment : Math.max(y0, ye) + sourceSegment;
          //   const ty = isSourceLeft ? Math.min(y0, ye) - targetSegment : Math.max(y0, ye) + targetSegment;
          //   result.push(new service.mxPoint(x0, sy));
          //   result.push(new service.mxPoint(xe, ty));
          // }
          // else if ((dep.y < arr.y) === isSourceLeft) {
          //   const midX = x0 + (xe - x0) / 2;
          //
          //   result.push(dep);
          //   result.push(new service.mxPoint(midX, dep.y));
          //   result.push(new service.mxPoint(midX, arr.y));
          //   result.push(arr);
          // }
          // else {
          result.push(dep);
          result.push(arr);
          // }
        }
      }
      else if (!['north', 'south'].includes(targetPos) && !['north', 'south'].includes(sourcePos)) {
        if (p0 !== null) {
          source = new service.mxCellState();
          source.x = p0.x;
          source.y = p0.y;
        }
        else if (source !== null) {
          isSourceLeft = isLeftTop(source, target, state, graph);
        }
        else {
          return;
        }

        if (pe !== null) {
          target = new service.mxCellState();
          target.x = pe.x;
          target.y = pe.y;
        }
        else if (target !== null) {
          isTargetLeft = isLeftTop(target, source, state, graph);
        }

        if (source !== null && target !== null) {
          // update order values if necessary
          source.cell.order === undefined && (source.cell.parent.children = addOrder(source.cell.parent.children, sourcePos));
          target.cell.order === undefined && (target.cell.parent.children = addOrder(target.cell.parent.children, targetPos));

          const sourceSegment = segment + segmentStep * source.cell.order;
          const targetSegment = segment + segmentStep * target.cell.order;

          const x0 = isSourceLeft ? source.x : source.x + source.width;
          const y0 = view.getRoutingCenterY(source);

          const xe = isTargetLeft ? target.x : target.x + target.width;
          const ye = view.getRoutingCenterY(target);


          let dx = sourceSegment * (isSourceLeft ? -1 : 1);
          const dep = new service.mxPoint(x0 + dx, y0);

          dx = targetSegment * (isTargetLeft ? -1 : 1);
          const arr = new service.mxPoint(xe + dx, ye);

          // // Adds intermediate points if both go out on same side
          // if (isSourceLeft === isTargetLeft) {
          //   const sx = isSourceLeft ? Math.min(x0, xe) - sourceSegment : Math.max(x0, xe) + sourceSegment;
          //   const tx = isSourceLeft ? Math.min(x0, xe) - targetSegment : Math.max(x0, xe) + targetSegment;
          //   result.push(new service.mxPoint(sx, y0));
          //   result.push(new service.mxPoint(tx, ye));
          // }
          // else if ((dep.x < arr.x) === isSourceLeft) {
          //   const midY = y0 + (ye - y0) / 2;
          //
          //   result.push(dep);
          //   result.push(new service.mxPoint(dep.x, midY));
          //   result.push(new service.mxPoint(arr.x, midY));
          //   result.push(arr);
          // }
          // else {
          result.push(dep);
          result.push(arr);
          // }
        }
      }
      // one of target or source ports are not located on NORTH or SOUTH size
      else {
        if (p0 !== null) {
          source = new service.mxCellState();
          source.x = p0.x;
          source.y = p0.y;
        }
        else if (source !== null) {
          isSourceLeft = isLeftTop(source, target, state, graph);
        }
        else {
          return;
        }

        if (pe !== null) {
          target = new service.mxCellState();
          target.x = pe.x;
          target.y = pe.y;
        }
        else if (target !== null) {
          isTargetLeft = isLeftTop(target, source, state, graph);
        }

        if (source !== null && target !== null) {
          // update order values if necessary
          source.cell.order === undefined && (source.cell.parent.children = addOrder(source.cell.parent.children, sourcePos));
          target.cell.order === undefined && (target.cell.parent.children = addOrder(target.cell.parent.children, targetPos));

          const sourceVertical = ['north', 'south'].includes(sourcePos);
          const targetVertical = ['north', 'south'].includes(targetPos);

          const sourceXy = sourceVertical ? 'y' : 'x';
          const targetXy = targetVertical ? 'y' : 'x';

          const sourceSegment = segment + segmentStep * source.cell.order;
          const targetSegment = segment + segmentStep * target.cell.order;

          let x0 = isSourceLeft ? source.x : source.x + source.width;
          let y0 = view.getRoutingCenterY(source);
          if (sourceVertical) {
            x0 = view.getRoutingCenterX(source);
            y0 = isSourceLeft ? source.y : source.y + source.height;
          }

          let xe = isTargetLeft ? target.x : target.x + target.width;
          let ye = view.getRoutingCenterY(target);
          if (targetVertical) {
            xe = view.getRoutingCenterX(target);
            ye = isTargetLeft ? target.y : target.y + target.height;
          }

          let d = sourceSegment * (isSourceLeft ? -1 : 1);
          const dep = sourceVertical ? new service.mxPoint(x0, y0 + d) : new service.mxPoint(x0 + d, y0);

          d = targetSegment * (isTargetLeft ? -1 : 1);
          const arr = targetVertical ? new service.mxPoint(xe, ye + d) : new service.mxPoint(xe + d, ye);

          // key has 4 sections:
          // 1 -- source port direction (north / east / south / west)
          // 2 -- target port direction (north / east / south / west)
          // most upper element (src / trg)
          // most left element (src / trg)
          const key = `${sourcePos}_${targetPos}_${dep.y < arr.y ? 'src' : 'trg'}_${dep.x < arr.x ? 'src' : 'trg'}`;
          const connections = {
            line: [dep, arr]
          };
          const pointSets = {
            south_east_src_trg: connections.line,
            south_east_trg_trg: [dep, new service.mxPoint(x0 + (xe - x0) / 2, dep.y), new service.mxPoint(x0 + (xe - x0) / 2, arr.y), arr],
            south_east_src_src: [dep, new service.mxPoint(dep.x, y0 + (ye - y0) / 2), new service.mxPoint(arr.x, y0 + (ye - y0) / 2), arr],
            south_east_trg_src: [dep, new service.mxPoint(arr.x, dep.y), arr],

            south_west_src_trg: [dep, new service.mxPoint(dep.x, y0 + (ye - y0) / 2), new service.mxPoint(arr.x, y0 + (ye - y0) / 2), arr],
            south_west_trg_trg: [dep, new service.mxPoint(arr.x, dep.y), arr],

            north_east_src_trg: [dep, new service.mxPoint(x0 + (xe - x0) / 2, dep.y), new service.mxPoint(x0 + (xe - x0) / 2, arr.y), arr],
            east_north_trg_src: [dep, new service.mxPoint(x0 + (xe - x0) / 2, dep.y), new service.mxPoint(x0 + (xe - x0) / 2, arr.y), arr]
          };


          if (pointSets[key]) {
            addPoints(pointSets[key], result);
          }
          // Adds intermediate points if both go out on same side
          else if (isSourceLeft === isTargetLeft) {
            if (sourceVertical) {
              const sy = isSourceLeft ? Math.min(y0, ye) - sourceSegment : Math.max(y0, ye) + sourceSegment;
              result.push(new service.mxPoint(x0, sy));
            }
            else {
              const sx = isSourceLeft ? Math.min(x0, xe) - sourceSegment : Math.max(x0, xe) + sourceSegment;
              result.push(new service.mxPoint(sx, y0));
            }

            if (targetVertical) {
              const ty = isSourceLeft ? Math.min(y0, ye) - targetSegment : Math.max(y0, ye) + targetSegment;
              result.push(new service.mxPoint(xe, ty));
            }
            else {
              const tx = isSourceLeft ? Math.min(x0, xe) - targetSegment : Math.max(x0, xe) + targetSegment;
              result.push(new service.mxPoint(tx, ye));
            }
          }
          else if ((dep[sourceXy] < arr[sourceXy]) === isSourceLeft) {
            const midY = y0 + (ye - y0) / 2;
            const midX = x0 + (xe - x0) / 2;

            result.push(dep);
            if (sourceVertical || targetVertical) {
              result.push(new service.mxPoint(midX, dep.y));
              result.push(new service.mxPoint(midX, arr.y));
            }
            else {
              result.push(new service.mxPoint(dep.x, midY));
              result.push(new service.mxPoint(arr.x, midY));
            }
            result.push(arr);
          }
          else {
            result.push(dep);
            result.push(arr);
          }
        }
      }
    };

    service.mxGraph.prototype.defaultLoopStyle = function (state, source, target, points, result) {
      if (source || target) {
        const segment = 12;
        const c = source || target;

        const direction = getDirection(c.cell.geometry);
        if (direction) {
          const coordsMap = {
            east: {
              x: c.x + c.width + segment * state.view.scale,
              y: c.y + c.height / 2
            },
            west: {
              x: c.x - segment * state.view.scale,
              y: c.y + c.height / 2
            },
            north: {
              x: c.x + c.width / 2,
              y: c.y - segment * state.view.scale
            },
            south: {
              x: c.x + c.width / 2,
              y: c.y + c.height + segment * state.view.scale
            }
          };
          result.push(new service.mxPoint(coordsMap[direction].x, coordsMap[direction].y));
        }
      }
    };

    service.mxEdgeStyle.pathViewStyle = function (state, source, target, points, result) {
      const view = state.view;
      const graph = view.graph;

      if (source != null && target != null && !source.cell.siteInfo) {
        const sourceY = source.getCenterY();
        const sourceParentState = graph.view.getState(source.cell.parent);
        const sourceParentY = sourceParentState.getCenterY();

        const targetY = target.getCenterY();
        const targetParentState = graph.view.getState(source.cell.parent);
        const targetParentY = targetParentState.getCenterY();

        let pt: any = {};
        let pt2: any = {};
        const sDifferent = sourceParentY - sourceY;
        if (sDifferent > 5) {
          pt = new service.mxPoint(source.getCenterX(), source.getCenterY());
          pt.y = source.y + source.height - 25;
        }
        else if (sDifferent < -5) {
          pt = new service.mxPoint(source.getCenterX(), source.getCenterY());
          pt.y = source.y + source.height + 10;
        }

        const tDifferent = targetParentY - targetY;
        if (tDifferent > 5) {
          pt2 = new service.mxPoint(target.getCenterX(), target.getCenterY());
          pt2.y = target.y + target.height - 25;
        }
        else if (tDifferent < -5) {
          pt2 = new service.mxPoint(target.getCenterX(), target.getCenterY());
          pt2.y = target.y + target.height + 10;
        }

        if (target.cell.parent.value && target.cell.parent.value.includes('FOADM')) {
          delete pt2.x;
          pt = new service.mxPoint(source.getCenterX(), source.getCenterY());
          pt.x += 10;
        }
        if (source.cell.parent.value && source.cell.parent.value.includes('FOADM')) {
          delete pt.x;
          pt2 = new service.mxPoint(target.getCenterX(), target.getCenterY());
          pt2.x -= 10;
        }

        if (pt.x) {
          result.push(pt);
        }
        if (pt2.x) {
          result.push(pt2);
        }
      }
    };

    service.mxEdgeStyle.CustomEntityRelation2 = function (state, source, target, points, result) {
      if (!target || !source) {
        return;
      }
      const view = state.view;
      const graph = view.graph;
      const tGeo = graph.getCellGeometry(target.cell);
      const sGeo = graph.getCellGeometry(source.cell);
      const targetPos = target.cell.placement;
      const sourcePos = source.cell.placement;
      const segment = 10 * view.scale;
      const segmentStep = 5;

      const pts = state.absolutePoints;
      const p0 = pts[0];
      const pe = pts[pts.length - 1];

      let isSourceLeft = false;

      if (p0 !== null) {
        source = new service.mxCellState();
        source.x = p0.x;
        source.y = p0.y;
      }
      else if (source !== null) {
        const constraint = service.mxUtils.getPortConstraints(source, state, true, service.mxConstants.DIRECTION_MASK_NONE);

        if (constraint !== service.mxConstants.DIRECTION_MASK_NONE && constraint !== service.mxConstants.DIRECTION_MASK_WEST +
          service.mxConstants.DIRECTION_MASK_EAST) {
          isSourceLeft = constraint === service.mxConstants.DIRECTION_MASK_WEST;
        }
        else {
          if (sGeo.relative) {
            isSourceLeft = sGeo.x <= 0.5;
          }
          else if (target !== null) {
            isSourceLeft = target.x + target.width < source.x;
          }
        }
      }
      else {
        return;
      }

      let isTargetLeft = true;

      if (pe != null) {
        target = new service.mxCellState();
        target.x = pe.x;
        target.y = pe.y;
      }
      else if (target != null) {
        const constraint = service.mxUtils.getPortConstraints(target, state, false, service.mxConstants.DIRECTION_MASK_NONE);

        if (constraint !== service.mxConstants.DIRECTION_MASK_NONE && constraint !== service.mxConstants.DIRECTION_MASK_WEST +
          service.mxConstants.DIRECTION_MASK_EAST) {
          isTargetLeft = constraint === service.mxConstants.DIRECTION_MASK_WEST;
        }
        else {
          if (tGeo.relative) {
            isTargetLeft = tGeo.x <= 0.5;
          }
          else if (source != null) {
            isTargetLeft = source.x + source.width < target.x;
          }
        }
      }

      if (source != null && target != null) {
        source.cell.order === undefined && (source.cell.parent.children = addOrder(source.cell.parent.children, sourcePos));
        target.cell.order === undefined && (target.cell.parent.children = addOrder(target.cell.parent.children, targetPos));

        const sourceSegment = segment + segmentStep * source.cell.order;
        const targetSegment = segment + segmentStep * target.cell.order;

        let x0 = isSourceLeft ? source.x : source.x + source.width;
        let y0 = view.getRoutingCenterY(source);
        if (['north', 'south'].includes(sourcePos)) {
          x0 = view.getRoutingCenterX(source);
          y0 = sourcePos === 'north' ? source.y : source.y + source.height;
        }

        let xe = (isTargetLeft) ? target.x : target.x + target.width;
        let ye = view.getRoutingCenterY(target);
        if (['north', 'south'].includes(targetPos)) {
          xe = view.getRoutingCenterX(target);
          ye = targetPos === 'north' ? target.y : target.y + target.height;
        }

        let dx = isSourceLeft ? -sourceSegment : sourceSegment;
        let dep = new service.mxPoint(x0 + dx, y0);
        if (['north', 'south'].includes(sourcePos)) {
          dep = new service.mxPoint(x0, y0 + (sourcePos === 'north' ? -sourceSegment : sourceSegment));
        }

        dx = (isTargetLeft) ? -targetSegment : targetSegment;
        let arr = new service.mxPoint(xe + dx, ye);
        if (['north', 'south'].includes(targetPos)) {
          arr = new service.mxPoint(xe, ye + (targetPos === 'north' ? -targetSegment : targetSegment));
        }

        result.push(dep);
        result.push(arr);
      }
    };

    const addOrder = ((cells: any[], placement) => {
      const xY = ['north', 'south'].includes(placement) ? 'x' : 'y';
      cells = [...cells];
      cells
        .filter((c: any) => c.edges && c.edges.length && c.placement === placement)
        .sort((c1: any, c2: any) => c1.geometry[xY] - c2.geometry[xY])
        .forEach((c: any, ind) => c.order = ind);
      return cells;
    });

    const isLeftTop = (cell1, cell2, state, graph) => {
      let isLeftTop = false;
      const constraint = service.mxUtils.getPortConstraints(cell1, state, true, service.mxConstants.DIRECTION_MASK_NONE);

      const vertical = ['north', 'south'].includes(cell1.cell.placement);
      let constr = service.mxConstants.DIRECTION_MASK_WEST + service.mxConstants.DIRECTION_MASK_EAST;
      constr = vertical ? service.mxConstants.DIRECTION_MASK_NORTH + service.mxConstants.DIRECTION_MASK_SOUTH : constr;
      if (constraint !== service.mxConstants.DIRECTION_MASK_NONE && constraint !== constr) {
        isLeftTop = constraint === (vertical ? service.mxConstants.DIRECTION_MASK_WEST : service.mxConstants.DIRECTION_MASK_NORTH);
      }
      else {
        const geometry = graph.getCellGeometry(cell1.cell);
        const xy = vertical ? 'y' : 'x';
        const widthHeight = vertical ? 'height' : 'width';

        if (geometry.relative) {
          isLeftTop = geometry[xy] <= 0.5;
        }
        else if (cell2 !== null) {
          isLeftTop = cell2[xy] + cell2[widthHeight] < cell1[xy];
        }
      }
      return isLeftTop;
    };

    const addPoints = (points, result) => {
      points.forEach(point => result.push(point));
    };

    const getDirection = (pt: any) => {
      if (pt.x < 0 && pt.y < 0) {
        return pt.x < pt.y ? 'west' : 'north';
      }
      else if (pt.x < 0 || pt.y < 0) {
        return pt.x < 0 ? 'west' : 'north';
      }
      return pt.x < pt.y ? 'south' : 'east';
    };
  }
}

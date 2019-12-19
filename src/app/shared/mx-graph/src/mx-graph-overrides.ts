import * as lodash from 'lodash';

export default class MxgraphOverrides {
  static overrideInsertFunctions(service) {
    service.mxGraph.prototype.insertVertex = function (parent, id, value, x, y, width, height, style, relative) {
      removeExistingCell(id, this);

      const vertex = this.createVertex(parent, id, value, x, y, width, height, style, relative);
      return this.addCell(vertex, parent);
    };

    service.mxGraph.prototype.insertEdge = function (parent, id, value, source, target, style) {
      removeExistingCell(id, this);

      const edge = this.createEdge(parent, id, value, source, target, style);
      return this.addEdge(edge, parent, source, target);
    };

    function removeExistingCell(id, graph) {
      if (id) {
        const existingCell = graph.getModel().getCell(id);
        if (existingCell) {
          graph.removeCells([existingCell]);
        }
      }
    }
  }

  static popupMenuAddItem(service) {
    // override addItem function - add disabled class to icon td element
    service.mxPopupMenu.prototype.addItem = function(title, image, funct, parent, iconCls, enabled, active) {
      parent = parent || this;
      this.itemCount++;

      // Smart separators only added if element contains items
      if (parent.willAddSeparator) {
        if (parent.containsItems) {
          this.addSeparator(parent, true);
        }
        parent.willAddSeparator = false;
      }

      parent.containsItems = true;
      const tr = document.createElement('tr');
      tr.className = 'mxPopupMenuItem' +
        ((enabled != null && !enabled) ? ' mx-disabled' : '');
      const col1 = document.createElement('td');
      col1.className = 'mxPopupMenuIcon';
      col1.style.width = '28px';

      // Adds the given image into the first column
      if (image != null) {
        const img = document.createElement('img');
        img.src = image;
        col1.appendChild(img);
      }
      else if (iconCls != null) {
        const div = document.createElement('div');
        div.className = iconCls;
        col1.appendChild(div);
      }

      tr.appendChild(col1);

      if (this.labels) {
        const col2 = document.createElement('td');
        col2.className = 'mxPopupMenuItem';

        col2.innerHTML = title;
        col2.align = 'left';
        tr.appendChild(col2);

        const col3 = document.createElement('td');
        col3.className = 'mxPopupMenuItem';
        col3.style.paddingRight = '6px';
        col3.style.textAlign = 'right';

        tr.appendChild(col3);

        if (parent.div == null) {
          this.createSubmenu(parent);
        }
      }

      parent.tbody.appendChild(tr);

      if (active != false && enabled != false) {
        let currentSelection = null;

        service.mxEvent.addGestureListeners(tr,
          service.mxUtils.bind(this, function (evt) {
            this.eventReceiver = tr;

            if (parent.activeRow != tr && parent.activeRow != parent) {
              if (parent.activeRow != null && parent.activeRow.div.parentNode != null) {
                this.hideSubmenu(parent);
              }
              if (tr['div'] != null) {
                this.showSubmenu(parent, tr);
                parent.activeRow = tr;
              }
            }

            // Workaround for lost current selection in page because of focus in IE
            if (service.mxClient.IS_QUIRKS || document['documentMode'] == 8) {
              currentSelection = document['selection'].createRange();
            }
            service.mxEvent.consume(evt);
          }),
          service.mxUtils.bind(this, function (evt) {
            if (parent.activeRow != tr && parent.activeRow != parent) {
              if (parent.activeRow != null && parent.activeRow.div.parentNode != null) {
                this.hideSubmenu(parent);
              }

              if (this.autoExpand && tr['div'] != null) {
                this.showSubmenu(parent, tr);
                parent.activeRow = tr;
              }
            }

            // Sets hover style because TR in IE doesn't have hover
            tr.className = 'mxPopupMenuItemHover';
          }),
          service.mxUtils.bind(this, function (evt) {
            // EventReceiver avoids clicks on a submenu item
            // which has just been shown in the mousedown
            if (this.eventReceiver == tr) {
              if (parent.activeRow != tr) {
                this.hideMenu();
              }

              // Workaround for lost current selection in page because of focus in IE
              if (currentSelection != null) {
                // Workaround for "unspecified error" in IE8 standards
                try {
                  currentSelection.select();
                }
                catch(e) {}
                currentSelection = null;
              }
              funct && funct(evt);
            }

            this.eventReceiver = null;
            service.mxEvent.consume(evt);
          })
        );

        // Resets hover style because TR in IE doesn't have hover
        service.mxEvent.addListener(tr, 'mouseout',
          service.mxUtils.bind(this, function (evt) {
            tr.className = 'mxPopupMenuItem';
          })
        );
      }
      return tr;
    };
  }

  static popupMenu(service) {
    // override popup function - open menu in top right of element except in shelfs
    service.mxPopupMenu.prototype.popup = function (x, y, cell, evt) {
      if (this.div != null && this.tbody != null && this.factoryMethod != null) {
        if (cell && (cell.edge || cell.opticalSiteFrame)) {
          this.div.style.left = x + 'px';
          this.div.style.top = y + 'px';
        }
        else if (cell == null || window.location.pathname.includes('shelves')) {
          setTimeout(() => {
            let xPosition = x;
            let yPosition = y;
            let container = document.querySelector('.port-item.selected');
            let listElement;
            let scaleFactor = this.graph.view.scale;
            if (container == null) {
              container = document.querySelector('.card.selected-card');
              if (container != null) {
                listElement = container.querySelector('.selected-indicator');
              }
            }
            else {
              listElement = container.querySelector('.port-item-icon');
            }

            if (listElement != null) {

              let element = listElement;
              let styles = window.getComputedStyle(element);
              let padding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
              let border = parseFloat(styles.borderLeft) + parseFloat(styles.borderRight);
              let bounding = element.getBoundingClientRect();
              // let elementWidth = (element.clientWidth * scaleFactor) - padding + border;
              let elementWidth = (bounding.width);
              let zoomScale = window.devicePixelRatio;
              xPosition = (bounding.left + elementWidth) / zoomScale;
              yPosition = bounding.top / zoomScale;
            }
            this.div.style.left = xPosition + 'px';
            this.div.style.top = yPosition + 'px';
          })
        }
        else {
          const path = service.commonService.getEventPath(evt);
          const offsetLeft = path.find(p => p.classList && p.classList.contains('canvas-container')).offsetLeft;
          const offsetTop = path.find(p => p.classList && p.classList.contains('canvas-container')).offsetTop;
          const scaleFactor = this.graph.view.scale;
          const graphState = this.graph.view.getState(cell);
          const breadCrumbs = document.querySelector('.bread-crumbs') ? document.querySelector('.bread-crumbs').clientHeight : 0;
          // show popup near items inside rack
          if (lodash.get(cell, 'parent.value', '') && lodash.get(cell, 'parent.value', '').includes('Rack')) {
            this.div.style.left = graphState.x + (cell.geometry.width * scaleFactor) + offsetLeft + 'px';
          }
          else {
            let ductCells = cell.children && cell.children.length ? cell.children.filter(x => x.id.includes('_duct')) : null;
            if (ductCells && ductCells.length > 0 && (ductCells.length === 2 || ductCells[0] && ductCells[0].geometry.x === 0)) { //check if 2 ears or just left ear
              const childrenWidth = ductCells[0].geometry.width;
              this.div.style.left = graphState.x + ((cell.geometry.width - childrenWidth) * scaleFactor) + offsetLeft + 'px';
            }
            else {
              this.div.style.left = graphState.x + (cell.geometry.width * scaleFactor) + offsetLeft + 'px';
            }
          }
          this.div.style.top = graphState.y + offsetTop + breadCrumbs + 'px';
        }

        // Removes all child nodes from the existing menu
        while (this.tbody.firstChild != null) {
          service.mxEvent.release(this.tbody.firstChild);
          this.tbody.removeChild(this.tbody.firstChild);
        }

        this.itemCount = 0;
        this.factoryMethod(this, cell, evt);
        let panel = document.getElementsByClassName('ui-tabview-panels');

        if (this.itemCount > 0) {
          const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
          if (panel[0].classList.contains('open') && panel[0].classList.contains('true')) {
            wait(500).then(() => {
              let topOffset = parseInt(this.div.style.top);
              topOffset = topOffset - 110;
              this.div.style.top = topOffset + 'px';
              this.showMenu();
              this.fireEvent(new service.mxEventObject(service.mxEvent.SHOW));
            });
          }
          else {
            this.showMenu();
            this.fireEvent(new service.mxEventObject(service.mxEvent.SHOW));
          }
        }
      }

      const menuElementTable = Array.from(document.querySelectorAll('table.mxPopupMenu'));
      let timeoutID;
      let graph = this.graph;
      let mouseleave = function() {
        timeoutID = setTimeout(() => {
          graph.popupMenuHandler.hideMenu(true);
        }, 7000);
      };

      let mouseenter = function() {
        window.clearTimeout(timeoutID);
      };

      if (menuElementTable) {
        menuElementTable.forEach((elem: any) => {
          elem.removeEventListener('mouseleave', mouseleave);
          elem.removeEventListener('mouseenter', mouseenter);
          elem.addEventListener('mouseleave', mouseleave);
          elem.addEventListener('mouseenter', mouseenter);
        });

        mouseleave();
      }
    };
  }

  static hideMenu(service) {
    // override hideMenu function - to remove with fade out
    service.mxPopupMenu.prototype.hideMenu = function (animation) {
      if (this.div != null) {
        if (this.div.parentNode != null) {
          this.div.parentNode.removeChild(this.div);
        }
        this.hideSubmenu(this);

        this.containsItems = false;
        this.fireEvent(new service.mxEventObject(service.mxEvent.HIDE));
      }

      Array.from(document.querySelectorAll('div.mxPopupMenu')).forEach((div: HTMLDivElement) => {
        div.remove();
      });
    };
  }

  static addSeparator(service) {
    // override addSeparator function
    service.mxPopupMenu.prototype.addSeparator = function(parent, force) {
      parent = parent || this;

      if (this.smartSeparators && !force) {
        parent.willAddSeparator = true;
      }
      else if (parent.tbody !== null) {
        parent.willAddSeparator = false;
        const tr = document.createElement('tr');

        const col2 = document.createElement('td');
        col2.style.padding = '0 0 0 0px';
        col2.setAttribute('colSpan', '3');

        const hr = document.createElement('hr');
        hr.setAttribute('size', '1');
        col2.appendChild(hr);

        tr.appendChild(col2);

        parent.tbody.appendChild(tr);
      }
    };
  }

  static modifyParallelOverlay(service) {
    const spacing = 25;
    service.mxParallelEdgeLayout.prototype.layout = function (parallels) {
      parallels.sort((a: any, b: any) => a.id.localeCompare(b.id));
      const edge = parallels[0];
      const view = this.graph.getView();
      const model = this.graph.getModel();
      const src = model.getGeometry(view.getVisibleTerminal(edge, true));
      const trg = model.getGeometry(view.getVisibleTerminal(edge, false));

      // Routes multiple loops
      if (src == trg) {
        let x0 = src.x + src.width + spacing;
        let y0 = src.y + src.height / 2;

        for (let i = 0; i < parallels.length; i++) {
          this.route(parallels[i], x0 , y0);
          x0 += spacing;
        }
      }
      else if (src != null && trg != null) {
        // Routes parallel edges
        const scx = src.x + src.width / 2;
        const scy = src.y + src.height / 2;

        const tcx = trg.x + trg.width / 2;
        const tcy = trg.y + trg.height / 2;

        const dx = tcx - scx;
        const dy = tcy - scy;

        const len = Math.sqrt(dx * dx + dy * dy);

        if (len > 0) {
          let x0 = scx + dx / 2;
          let y0 = scy + dy / 2;

          const nx = dy * spacing / len;
          const ny = dx * spacing / len;

          x0 += nx * (parallels.length - 1) / 2;
          y0 -= ny * (parallels.length - 1) / 2;

          parallels.forEach(edge => {
            const vertical = isVertical({...src, center: {x: scx, y: scy}}, {...trg, center: {x: tcx, y: tcy}});
            const xyToCheck = vertical ? 'y' : 'x';
            const _src = src[xyToCheck] < trg[xyToCheck] ? src : trg;

            const flipped = _src !== src;

            const _trg = flipped ? src : trg;
            const _scx = flipped ? tcx : scx;
            const _scy = flipped ? tcy : scy;
            const _tcx = flipped ? scx : tcx;
            const _tcy = flipped ? scy : tcy;
            const left = service.count++ % 2 !== 0;

            const reversed = flipped ? _src === edge.source.geometry : _src !== edge.source.geometry;

            const katetNear = vertical ? Math.abs(_scx - _tcx) : Math.abs(_scy - _tcy);
            const katetFar = vertical ? Math.abs(_src.y + _src.height - _trg.y) : Math.abs(_src.x + _src.width - _trg.x);
            const angle = Math.atan(katetFar/katetNear);
            const offset = ((spacing / 2) / Math.sin(angle)) * (left ? 1 : -1);


            let points = [
              vertical ? new service.mxPoint(_scx + offset, _src.y + _src.height) : new service.mxPoint(_src.x + _src.width, _scy + offset),
              vertical ? new service.mxPoint(_tcx + offset, _trg.y) : new service.mxPoint(_trg.x, _tcy + offset)
            ];

            if (+flipped ^ +reversed) {
              points = points.reverse();
            }

            this.setEdgePoints(edge, points);
            x0 -= nx;
            y0 += ny;
          });
        }
      }
    };

    function isVertical(source: any, target: any) {
      const top = source.center.y < target.center.y ? source : target;
      const bottom = top === source ? target : source;
      const left = source.center.x < target.center.x ? source : target;
      const right = left === source ? target : source;
      const verticalDistance = bottom.y - top.y - top.height;
      const horizontalalDistance = right.x - left.x - left.width;

      return verticalDistance > horizontalalDistance;
    }
  }

  static createSelectionShape(service) {
    service.mxVertexHandler.prototype.createSelectionShape = function (bounds) {
      const shape = new service.mxRectangleShape(bounds, null, this.getSelectionColor());
      shape.strokewidth = this.getSelectionStrokeWidth();
      shape.isDashed = this.isSelectionDashed();
      const style = this.state.cell.getStyle();
      if (style) {
        shape.isRounded = service.styleDecode(style).rounded === '1';
      }
      return shape;
    };
  }

  static isToggleEvent(service) {
    service.mxGraph.prototype.isToggleEvent = function(	evt	) {
      if (evt.newRouteMode) {
        return true;
      }
      else {
        return (service.mxClient.IS_MAC) ? service.mxEvent.isMetaDown(evt) : service.mxEvent.isControlDown(evt);
      }
    }
  }
}

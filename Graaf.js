class Graaf {
	constructor({cells, edges, domains, lectures}, lecture) {
		this.cells = cells;
		this.edges = edges;
		this.domains = domains;
		this.lecture = lectures.find((m) => m.number === lecture);
		if(!this.lecture) {
			this.lecture = lectures[0];
		}
		this.currView = "lecture";
		this.g = {};
		this.paper = {};
		this.lastPos = {
			x: 0,
			y: 0
		};
		this.scale = {
			lecture: {
				s: 0.7
			},
			all: {
				s: 0.5
			},
			domains: {
				s: 1.0
			}
		};
		this.origin = {
			lecture: {
				x: 0.0,
				y: 0.0
			},
			all: {
				x: 0.0,
				y: 0.0
			},
			domains: {
				x: 0.0,
				y: 0.0			}
		};
		this.transitionTime = 1000;
		this.buildGraph();
		this.initControls();
	}

	switchView(view) {
		this.lecture.removeLectureBoxes();

		let oldS = this.scale[this.currView].s;
		let newS = this.scale[view].s;
		let oldO = this.origin[this.currView];
		let newO = this.origin[view];
		let totalT = this.transitionTime*Math.abs(oldS - newS);
		let currT = 0;
		let interval = 10;

		let fun = setInterval(() => {
			if (currT < totalT) {
				let progress = currT / totalT;
				this.paper.scale(oldS + (newS - oldS) * progress, oldS + (newS - oldS) * progress);
				this.paper.setOrigin(oldO.x + (newO.x - oldO.x)*progress, oldO.y + (newO.y - oldO.y)*progress);
				currT += interval;
			} else {
				clearInterval(fun);
			}
		}, interval);

		setTimeout(() => {
			switch (view) {
				case "lecture":
					this.showLecture(this.currView);
					break;
				case "all":
					this.showAll(this.currView);
					break;
				case "domains":
					this.showDomains();
					break;
			}
			this.currView = view;
		}, oldS - newS > 0? totalT : 0);
	}

	initControls() {
		let self = this;

		let startMoving = function (evt, x, y) {
			let ox = evt.offsetX, oy = evt.offsetY;
			if(typeof(ox) === "undefined") {
				ox = evt.touches[0].clientX;
				oy = evt.touches[0].clientY;
			}
			self.lastPos = {x: ox, y: oy};
		};

		let move = function (evt, x, y) {
			let dx = evt.offsetX, dy = evt.offsetY;
			if(typeof(dx) === "undefined") {
				dx = evt.touches[0].clientX;
				dy = evt.touches[0].clientY;
			}
			dx = dx - self.lastPos.x;
			dy = dy - self.lastPos.y;

			self.paper.setOrigin(self.paper.options.origin.x + dx, self.paper.options.origin.y + dy);
			self.origin[self.currView] = {
				x: self.paper.options.origin.x + dx,
				y: self.paper.options.origin.y + dy};
			self.lastPos.x += dx;
			self.lastPos.y += dy;
		};

		let scale = function (evt, x, y, delta) {
			self.zoom(0.025 * delta);
		};
		this.paper.on('blank:pointerdown', startMoving);
		this.paper.on('blank:pointermove', move);
		this.paper.on('cell:pointermove', function (cellView, evt, x, y ) {
			let cell = self.cells.find((c) => c.matchesElement(cellView.model.attributes));
			cell.pos.x = cellView.model.attributes.position.x;
			cell.pos.y = cellView.model.attributes.position.y;
		});
	}

	getLayout(dir, callback) {
		let self = this;

		let getMainLayout = (cb) => {
			$.ajax({
				url: dir + "graph.json",
				dataType: 'json',
				error: function (status) {
					console.log("no layout has been defined yet");
					let graphBBox = joint.layout.DirectedGraph.layout(self.g, {
						nodeSep: 10,
						edgeSep: 10,
						rankDir: "LR"
					});
					self.cells.forEach((c) => {
						c.pos = c.element.attributes.position;
					});
					self.centerOverview();
					self.showNone();
					cb();
				},
				success: function (data) {
					data.cells.filter((d) => d.type !== "standard.Link").forEach((d) => {
						let cell = self.cells.find((c) => c.matchesElement(d));
						if(cell) {
							cell.element.position(d.position.x, d.position.y);
							cell.pos = d.position;
						}
					});
					self.centerOverview();
					self.showNone();
					cb();
				}
			});
		};

		let getDomainLayout = (cb) => {
			$.ajax({
				url: dir + "domain_graph.json",
				dataType: 'json',
				error: function (status) {
					console.log("no layout for the domain has been defined yet");
					cb();
				},
				success: function (data) {
					data.cells.filter((d) => d.type !== "standard.Link").forEach((d) => {
						let name = d.attrs.label.text.replace('\n', ' ');
						let domain = self.domains.find((c) => state.compareStr(c.domain, name));
						domain.cell.element.position(d.position.x, d.position.y);
						domain.cell.pos = d.position;
					});
					self.centerDomains();
					cb();
				}
			});
		};

		getMainLayout(() => {
			getDomainLayout(callback);
		});
	}

	buildGraph() {
		let graph = new joint.dia.Graph;
		this.g = graph;

		let div = document.getElementById('graaf');

		this.paper = new joint.dia.Paper({
			el: div,
			model: graph,
			width: div.clientWidth,
			height: div.clientHeight,
			gridSize: 10,
			drawGrid: state.editmode ? 'mesh' : false
		});

		let height = 70;
		this.domains.forEach((d) => {
			this.makeSVGElement(d.domain, d.svg);
			d.makeElement(graph, 2.13 * height, height);
		});

		this.domains.forEach((d) => {
			d.cell.outGoingEdges.forEach((de) => {
				de.makeLink(graph, false);
			});
		});

		this.cells.forEach((c) => {
			c.makeElement(graph, 2.13 * height, height);
		});

		this.edges.forEach((e) => {
			e.makeLink(graph);
			this.lecture.addEdgeEndIfRelated(e);
		});

		this.lecture.makeCellsGlow();
		this.lecture.makeLectureBoxes(this);
		this.lecture.orderForLayout();

		this.paper.scale(this.scale[this.currView].s, this.scale[this.currView].s);

		return graph;
	}

	centerDomains() {
		let left = this.domains.reduce((m, el) => Math.min(m, el.cell.pos.x), this.domains[0].cell.pos.x);
		let right = this.domains.reduce((m, el) => Math.max(m, el.cell.pos.x), this.domains[0].cell.pos.x) + this.domains[0].cell.width;
		let top = this.domains.reduce((m, el) => Math.min(m, el.cell.pos.y), this.domains[0].cell.pos.y);
		let bottom = this.domains.reduce((m, el) => Math.max(m, el.cell.pos.y), this.domains[0].cell.pos.y) + this.domains[0].cell.height;
		this.scale["domains"].s = Math.min(this.paper.options.width / (right - left + 50), this.paper.options.height / (bottom - top + 50));
		let marginX = (this.paper.options.width/this.scale["domains"].s - (right - left))/2;
		let marginY = (this.paper.options.height/this.scale["domains"].s - (bottom - top))/2;
		this.domains.forEach(d => {
			let c = d.cell;
			c.pos.x += marginX - left;
			c.pos.y += marginY - top;
			c.element.position(c.pos.x, c.pos.y);
		});
	}

	centerOverview() {
		let left = this.cells.reduce((m, el) => Math.min(m, el.pos.x), this.cells[0].pos.x);
		let right = this.cells.reduce((m, el) => Math.max(m, el.pos.x), this.cells[0].pos.x) + this.cells[0].width;
		let top = this.cells.reduce((m, el) => Math.min(m, el.pos.y), this.cells[0].pos.y);
		let bottom = this.cells.reduce((m, el) => Math.max(m, el.pos.y), this.cells[0].pos.y) + this.cells[0].height;
		this.scale["all"].s = Math.min(this.paper.options.width / (right - left + 50), this.paper.options.height / (bottom - top + 50));
		let marginX = (this.paper.options.width/this.scale["all"].s - (right - left))/2;
		let marginY = (this.paper.options.height/this.scale["all"].s - (bottom - top))/2;
		this.cells.forEach(c => {
			c.pos.x += marginX - left;
			c.pos.y += marginY - top;
			c.element.position(c.pos.x, c.pos.y);
		});
	}

	showAll(lastView) {
		if (lastView === "domains") {
			this.domains.forEach(d => {
				d.cell.element.remove();
			});
			this.cells.forEach((c) => {
				c.element.addTo(this.g);
				c.element.position(c.domain.cell.pos.x, c.domain.cell.pos.y);
				c.moveTo(c.pos.x, c.pos.y, this.transitionTime);
			});
			this.edges.forEach((e) => {
				e.link.addTo(this.g);
			});
		} else if (lastView === "lecture") {
			this.cells.forEach((c) => {
				c.moveTo(c.pos.x, c.pos.y, this.transitionTime);
				setTimeout(() => {
					c.element.addTo(this.g)
				}, this.transitionTime*0.5);
			});
			this.edges.forEach(e => {
				setTimeout(() => {
					e.link.addTo(this.g)
				}, this.transitionTime);
			})
		}

	}

	showNone() {
		this.cells.forEach((c) => {
			c.element.remove();
		});

		this.domains.forEach((d) => {
			d.cell.element.remove();
		});
	}

	showDomains() {
		this.cells.forEach((c) => {
			let domain = c.domain;
			c.moveTo(domain.cell.pos.x, domain.cell.pos.y, this.transitionTime);
		});
		setTimeout(() => {
			this.showNone();
			this.domains.forEach((d) => {
				d.cell.element.addTo(this.g);
			});
			this.domains.forEach((d) => {
				d.cell.outGoingEdges.forEach((e) => {
					e.link.addTo(this.g);
				});
			});
		}, this.transitionTime);
	}

	showLecture(lastView) {
		if (lastView === "all") {
			this.cells.forEach((c) => {
				if (!this.lecture.cellIsRelated(c)) {
					setTimeout(() => c.element.remove(), 300);
				}
			});
			this.lecture.prevCells.forEach(c => {
				c.inComingEdges.forEach(e => {
					setTimeout(() => e.link.remove(), 300);
				});
				c.outGoingEdges.forEach(e => {
					if(!this.lecture.edgeIsRelated(e)){
						setTimeout(() => e.link.remove(), 300);
					}
				});
			});
			this.lecture.nextCells.forEach(c => {
				c.outGoingEdges.forEach(e => {
					setTimeout(() => e.link.remove(), 300);
				});
			});
		} else if (lastView === "domains") {
			this.domains.forEach(d => {
				d.cell.element.remove();
			});
			this.cells.forEach((c) => {
				if (this.lecture.cellIsRelated(c)) {
					c.element.addTo(this.g);
					c.element.position(c.domain.cell.pos.x, c.domain.cell.pos.y);
				}
			});
			this.edges.forEach((e) => {
				if (this.lecture.edgeIsRelated(e)) {
					e.link.addTo(this.g);
				}
			});
		} else {
			this.cells.forEach((c) => {
				if (this.lecture.cellIsRelated(c)) {
					c.element.addTo(this.g);
				}
			});

			this.edges.forEach((e) => {
				if (this.lecture.edgeIsRelated(e)) {
					e.link.addTo(this.g);
				}
			});
		}

		let t = this.transitionTime;
		if (lastView === "lecture") {
			t = 0;
		}

		this.lecture.positionCells(this.lecture.prevCells, this.lecture.margin.x, this.lecture.margin.y, t);
		this.lecture.positionCells(this.lecture.cells, this.lecture.margin.x + this.lecture.width, this.lecture.margin.y, t);
		this.lecture.positionCells(this.lecture.nextCells, this.lecture.margin.x + this.lecture.width * 2, this.lecture.margin.y, t);


		setTimeout(() => {
			this.lecture.cells.forEach((c) => {
				this.lecture.elNow.embed(c.element);
			});

			this.lecture.prevCells.forEach((c) => {
				this.lecture.elPrev.embed(c.element);
			});

			this.lecture.nextCells.forEach((c) => {
				this.lecture.elNext.embed(c.element);
			});

			this.lecture.elNow.addTo(this.g);
			this.lecture.elPrev.addTo(this.g);
			this.lecture.elNext.addTo(this.g);
		}, t);
	}

	zoom(ds) {
		this.scale[this.currView] = {
			s: this.scale[this.currView].s + ds,
		};
		this.paper.scale(this.scale[this.currView].s, this.scale[this.currView].s);
	}

	saveGraph() {
		let download = function (content, fileName, contentType) {
			let a = document.createElement("a");
			let file = new Blob([content], {type: contentType});
			a.href = URL.createObjectURL(file);
			a.download = fileName;
			a.click();
		};
		download(JSON.stringify(this.g.toJSON()), 'graph.json', 'JSON');
	}

	makeSVGElement(name, svg) {
		joint.dia.Element.define('standard.' + name, {
			attrs: {
				image: {
					'xlink:href': 'data:image/svg+xml;base64,' + btoa(svg)
				},
				label: {
					textVerticalAnchor: 'middle',
					textAnchor: 'middle',
					refX: '50%',
					refY: '50%',
					fontSize: 14,
					fill: 'black'
				}
			}
		}, {
			markup: [{
				tagName: 'image',
				selector: 'image',
			}, {
				tagName: 'text',
				selector: 'label'
			}]
		});
	}
}

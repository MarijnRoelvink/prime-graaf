class Graaf {
	constructor({cells, edges, domains, lectures}, lecture, callback) {
		this.cells = cells;
		this.edges = edges;
		this.domains = domains;
		this.lectures = lectures;
		this.lecture = lectures.find((m) => m.number === lecture);
		this.currView = "week";
		this.g = {};
		this.paper = {};
		this.lastPos = {
			x: 0,
				y: 0
		};
		this.scale = {sx: 0.7, sy: 0.7};
		this.buildGraph();
		this.initControls();
	}

	switchView(view) {
		this.removeLectureBoxes();
		switch(view) {
			case "lecture": this.showLecture(); break;
			case "unstructured": this.showLectureUnstructured(); break;
			case "all": this.showAll(); break;
			case "domains": this.showDomains(); break;
		}
	}

	initControls() {
		let self = this;

		let startMoving = function(evt, x, y) {
			self.lastPos = {x: x*self.scale.sx, y: y*self.scale.sy};
		};

		let move = function(evt, x, y) {
			self.paper.translate((evt.offsetX - self.lastPos.x), (evt.offsetY - self.lastPos.y));
		};

		let scale = function (evt, x, y, delta) {
			self.scale = {
				sx: self.scale.sx + 0.025*delta,
				sy: self.scale.sy + 0.025*delta
			};
			self.paper.scale(self.scale.sx, self.scale.sy);
		};
		this.paper.on('blank:pointerdown', startMoving);
		this.paper.on('blank:pointermove', move);
		
		this.paper.on('blank:mousewheel', scale);
		this.paper.on('element:mousewheel', function (cv, evt, x, y, delta) {
			scale(evt, x, y, delta);
		});
	}

	getLayout(dir, callback) {
		let self = this;

		let getMainLayout = (cb) => {
			$.ajax({
				url: dir + "graph.json",
				dataType:'json',
				error: function(status)
				{
					console.log("no layout has been defined yet");
					cb();
				},
				success: function(data)
				{
					data.cells.filter((d) => d.type !== "standard.Link").forEach((d) => {
						let name = d.attrs.label.text.replace('\n', ' ');
						console.log(name);
						let cell = self.cells.find((c) => c.name === name);
						cell.element.position(d.position.x, d.position.y);
						cell.pos = d.position;
					});
					cb();
				}
			});
		};

		let getDomainLayout = (cb) => {
			$.ajax({
				url: dir + "domain_graph.json",
				dataType:'json',
				error: function(status)
				{
					console.log("no layout for the domain has been defined yet");
					cb();
				},
				success: function(data)
				{
					data.cells.filter((d) => d.type !== "standard.Link").forEach((d) => {
						let name = d.attrs.label.text.replace('\n', ' ');
						let domain = self.domains.find((c) => c.domain === name);
						domain.cell.element.position(d.position.x, d.position.y);
						domain.cell.pos = d.position;
					});
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
			gridSize: 1
		});

		let height = 70;
		this.domains.forEach((d) => {
			this.makeSVGElement(d.domain, d.svg);
			d.makeElement(graph, 2.13*height, height);
		});

		this.domains.forEach((d) => {
			d.cell.outGoingEdges.forEach((de) => {
				de.makeLink(graph, false);
			});
		});

		this.cells.forEach((c) => {
			c.makeElement(graph, 2.13*height, height);
		});

		this.edges.forEach((e) => {
			e.makeLink(graph);
			this.lecture.addEdgeEndIfRelated(e);
		});

		this.lecture.makeCellsGlow();
		this.lecture.makeLectureBoxes(this.paper, this.scale);
		this.lecture.orderForLayout();

		let graphBBox = joint.layout.DirectedGraph.layout(graph, {
			nodeSep: 10,
			edgeSep: 10,
			rankDir: "LR"
		});

		this.cells.forEach((c) => {
			c.pos.x = c.element.attributes.position.x;
			c.pos.y = c.element.attributes.position.y;
		});

		this.paper.scale(this.scale.sx, this.scale.sy);
		return graph;
	}

	showAll() {
		this.showNone();
		this.cells.forEach((c) => {
			c.element.addTo(this.g);
			c.element.position(c.pos.x, c.pos.y);
		});

		this.edges.forEach((e) => {
			e.link.addTo(this.g);
		});
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
		this.showNone();
		this.domains.forEach((d) => {
			d.cell.element.addTo(this.g);
		});
		this.domains.forEach((d) => {
			d.cell.outGoingEdges.forEach((e) => {
				e.link.addTo(this.g);
			});
		});
	}

	showLectureUnstructured() {
		this.showNone();
		this.cells.forEach((c) => {
			if (!this.lecture.cellIsRelated(c)) {
				c.element.remove();
			} else {
				c.element.addTo(this.g);
			}
		});

		this.edges.forEach((e) => {
			if(this.lecture.edgeIsRelated(e)) {
				e.link.addTo(this.g);
			}
		});

		let graphBBox = joint.layout.DirectedGraph.layout(this.g, {
			nodeSep: 30,
			edgeSep: 20,
			rankDir: "TB",
			marginY: 40,
			marginX: 40
		});
	}

	showLecture() {
		this.showLectureUnstructured();

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

		this.lecture.positionCells(this.lecture.prevCells, this.lecture.margin.x, this.lecture.margin.y);
		this.lecture.positionCells(this.lecture.cells, this.lecture.margin.x + this.lecture.width, this.lecture.margin.y);
		this.lecture.positionCells(this.lecture.nextCells, this.lecture.margin.x + this.lecture.width*2, this.lecture.margin.y);
	}

	removeLectureBoxes() {
		this.lecture.cells.forEach((c) => {
			this.lecture.elNow.unembed(c.element);
		});

		this.lecture.nextCells.forEach((c) => {
			this.lecture.elNext.unembed(c.element);
		});

		this.lecture.prevCells.forEach((c) => {
			this.lecture.elPrev.unembed(c.element);
		});

		this.lecture.elNow.remove();
		this.lecture.elPrev.remove();
		this.lecture.elNext.remove();
	}

	saveGraph() {
		let download = function(content, fileName, contentType) {
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

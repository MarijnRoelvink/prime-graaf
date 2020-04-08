class Graaf {
	constructor({cells, edges, domains, lectures}, lecture) {
		this.cells = cells;
		this.edges = edges;
		this.domains = domains;
		this.lectures = lectures;
		this.lecture = lectures.find((m) => m.number === lecture);
		this.currView = "week";
		this.g = this.buildGraph();
	}

	switchView(view) {
		this.removeLectureBoxes();
		switch(view) {
			case "week": this.showLecture(); break;
			case "lecture": this.showLectureUnstructured(); break;
			case "all": this.showAll(); break;
		}
	}


	buildGraph() {
		let graph = new joint.dia.Graph;

		let paper = new joint.dia.Paper({
			el: document.getElementById('graaf'),
			model: graph,
			width: window.innerWidth * 2,
			height: window.innerHeight,
			gridSize: 1
		});

		this.domains.forEach((d) => {
			this.makeSVGElement(d.domain, d.svg);
		});

		this.cells.forEach((c) => {
			c.makeElement(graph, 2.13*60, 60);
		});

		this.edges.forEach((e) => {
			e.makeLink(graph);
			this.lecture.addEdgeIfRelated(e);
		});

		this.lecture.makeCellsGlow();
		this.lecture.makeLectureBoxes();

		let graphBBox = joint.layout.DirectedGraph.layout(graph, {
			nodeSep: 10,
			edgeSep: 10,
			rankDir: "TB"
		});

		paper.scale(0.8, 0.8);
		return graph;
	}

	showAll() {
		this.cells.forEach((c) => {
			c.element.addTo(this.g);
		});

		this.edges.forEach((e) => {
			e.link.addTo(this.g);
		});

		let graphBBox = joint.layout.DirectedGraph.layout(this.g, {
			nodeSep: 5,
			edgeSep: 5,
			rankDir: "TB",
			ranker: "longest-path"
		});

	}

	showLectureUnstructured() {
		this.cells.forEach((c) => {
			if (!(this.lecture.cells.includes(c) || this.lecture.prevCells.includes(c) || this.lecture.nextCells.includes(c))) {
				c.element.remove();
			}
		});

		let graphBBox = joint.layout.DirectedGraph.layout(this.g, {
			nodeSep: 20,
			edgeSep: 20,
			rankDir: "TB"
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

		let positionBelow = (cells, x, y, yMargin = 40) => {
			for (let i = 0; i < cells.length; i++) {
				cells[i].element.position(x + (this.lecture.width - cells[i].width)/2, yMargin + y + (cells[i].height + yMargin)*i);
			}
		};
		positionBelow(this.lecture.prevCells, this.lecture.margin, this.lecture.margin);
		positionBelow(this.lecture.cells, this.lecture.margin + this.lecture.width, this.lecture.margin);
		positionBelow(this.lecture.nextCells, this.lecture.margin + this.lecture.width*2, this.lecture.margin);
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

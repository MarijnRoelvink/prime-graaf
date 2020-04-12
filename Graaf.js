class Graaf {
	constructor({cells, edges, domains, lectures}, lecture, callback) {
		this.cells = cells;
		this.edges = edges;
		this.domains = domains;
		this.lectures = lectures;
		this.lecture = lectures.find((m) => m.number === lecture);
		this.currView = "week";
		this.g = {};
		this.buildGraph();
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

	getLayout(dir, callback) {
		let self = this;

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
						console.log(name);
						let domain = self.domains.find((c) => c.domain === name);
						domain.cell.element.position(d.position.x, d.position.y);
						domain.cell.pos = d.position;
					});
					cb();
				}
			});
		};

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

		getMainLayout(() => {
			getDomainLayout(callback);
		});
	}

	buildGraph() {
		let graph = new joint.dia.Graph;
		this.g = graph;

		let div = document.getElementById('graaf');
		let paper = new joint.dia.Paper({
			el: div,
			model: graph,
			width: div.clientWidth,
			height: div.clientHeight,
			gridSize: 1
		});

		this.domains.forEach((d) => {
			this.makeSVGElement(d.domain, d.svg);
			d.makeElement(graph, 2.13*60, 60);
		});

		this.domains.forEach((d) => {
			d.edges.forEach((de) => {
				de.makeLink(graph, false);
			});
		});

		this.cells.forEach((c) => {
			c.makeElement(graph, 2.13*60, 60);
		});

		this.edges.forEach((e) => {
			e.makeLink(graph);
			this.lecture.addEdgeEndIfRelated(e);
		});

		this.lecture.makeCellsGlow();
		this.lecture.makeLectureBoxes();

		let graphBBox = joint.layout.DirectedGraph.layout(graph, {
			nodeSep: 10,
			edgeSep: 10,
			rankDir: "TB"
		});

		this.cells.forEach((c) => {
			c.pos.x = c.element.attributes.position.x;
			c.pos.y = c.element.attributes.position.y;
		});

		paper.scale(0.7, 0.7);
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
			d.edges.forEach((e) => {
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

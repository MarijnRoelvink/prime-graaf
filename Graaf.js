class Graaf {
	constructor({cells, edges, domains, modules}, module) {
		this.cells = cells;
		this.edges = edges;
		this.domains = domains;
		this.modules = modules;
		this.module = modules.find((m) => m.number === module);
		this.currView = "week";
		this.g = this.buildGraph();
	}

	switchView(view) {
		this.removeModuleBoxes();
		switch(view) {
			case "week": this.showWeek(); break;
			case "module": this.showModule(); break;
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
			c.height = 60;
			c.width = 2.13*c.height;

			let wraptext = joint.util.breakText(c.name, {
				width: c.width
			});
			let el = new joint.shapes.standard[c.domain.domain]({
				attrs: {
					image: {
						width: c.width,
						height: c.height,
						marginTop: '20px'
					},
					label: {
						text: wraptext,
					}
				}
			});
			el.resize(c.width, c.height);
			el.addTo(graph);
			c.element = el;

			if(this.module.cells.includes(c)) {
				c.element.attr('./filter', {
					name: 'highlight',
					args: {
						color: '#70AB37',
						width: 6,
						opacity: 1,
						blur: 5
					}
				});
			}
		});

		this.edges.forEach((e) => {
			let link = new joint.shapes.standard.Link();
			link.source(e.from.element);
			link.target(e.to.element);
			link.attr('line/stroke', e.from.domain.color);
			link.router('metro', {
			});
			link.addTo(graph);
			e.link = link;

			this.module.addEdgeIfRelated(e);
		});

		this.module.makeModuleBoxes();

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

	showModule() {
		this.cells.forEach((c) => {
			if (!(this.module.cells.includes(c) || this.module.prevCells.includes(c) || this.module.nextCells.includes(c))) {
				c.element.remove();
			}
		});

		let graphBBox = joint.layout.DirectedGraph.layout(this.g, {
			nodeSep: 20,
			edgeSep: 20,
			rankDir: "TB"
		});
	}

	showWeek() {
		this.showModule();

		this.module.cells.forEach((c) => {
			this.module.elNow.embed(c.element);
		});

		this.module.prevCells.forEach((c) => {
			this.module.elPrev.embed(c.element);
		});

		this.module.nextCells.forEach((c) => {
			this.module.elNext.embed(c.element);
		});

		this.module.elNow.addTo(this.g);
		this.module.elPrev.addTo(this.g);
		this.module.elNext.addTo(this.g);

		let positionBelow = (cells, x, y, yMargin = 40) => {
			for (let i = 0; i < cells.length; i++) {
				cells[i].element.position(x + (this.module.width - cells[i].width)/2, yMargin + y + (cells[i].height + yMargin)*i);
			}
		};
		positionBelow(this.module.prevCells, this.module.margin, this.module.margin);
		positionBelow(this.module.cells, this.module.margin + this.module.width, this.module.margin);
		positionBelow(this.module.nextCells, this.module.margin + this.module.width*2, this.module.margin);
	}

	removeModuleBoxes() {
		this.module.cells.forEach((c) => {
			this.module.elNow.unembed(c.element);
		});

		this.module.nextCells.forEach((c) => {
			this.module.elNext.unembed(c.element);
		});

		this.module.prevCells.forEach((c) => {
			this.module.elPrev.unembed(c.element);
		});

		this.module.elNow.remove();
		this.module.elPrev.remove();
		this.module.elNext.remove();
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

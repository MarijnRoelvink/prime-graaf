class Graaf {
	constructor({cells, edges, domains, modules}, module) {
		this.cells = cells;
		this.edges = edges;
		this.domains = domains;
		this.modules = modules;
		this.module = modules.find((m) => m.number === module);
		this.currView = "week";
		this.cellHeight = 40;
		this.g = this.buildGraph({cells, edges, domains, modules});
	}

	switchView(view) {
		this.removeModuleBoxes();
		switch(view) {
			case "week": this.showWeek(); break;
			case "module": this.showModule(); break;
			case "all": this.showAll(); break;
		}
	}


	buildGraph({cells, edges, domains, modules}) {
		let graph = new joint.dia.Graph;

		let paper = new joint.dia.Paper({
			el: document.getElementById('graaf'),
			model: graph,
			width: window.innerWidth * 2,
			height: window.innerHeight,
			gridSize: 1
		});

		domains.forEach((d) => {
			this.makeSVGElement(d.domain, d.svg);
		});

		cells.forEach((c) => {
			c.width = c.name.length * 8;

			let el = new joint.shapes.standard[c.domain.domain]({
				attrs: {
					image: {
						width: c.name.length * 8,
						height: this.cellHeight,
						marginTop: '20px'
					},
					label: {
						text: c.name,
					}
				}
			});
			el.resize(c.name.length * 8, this.cellHeight);
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

		edges.forEach((e) => {
			let link = new joint.shapes.standard.Link();
			link.source(e.from.element);
			link.target(e.to.element);
			//link.attr('line/stroke', e.from.domain.color);
			link.addTo(graph);
			e.link = link;

			//Add next and previous topics to module structure
			let isFrom = this.module.cells.includes(e.from);
			let isTo = this.module.cells.includes(e.to);
			if (isFrom && !this.module.cells.includes(e.to)) {
				this.module.nextCells.push(e.to);
			} else if (isTo && !this.module.cells.includes(e.from)) {
				this.module.prevCells.push(e.from);
			}
		});

		this.makeModuleBoxes();

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
				cells[i].element.position(x + (this.module.width - cells[i].width)/2, yMargin + y + (this.cellHeight + yMargin)*i);
			}
		};
		positionBelow(this.module.prevCells, this.module.margin, this.module.margin);
		positionBelow(this.module.cells, this.module.margin + this.module.width, this.module.margin);
		positionBelow(this.module.nextCells, this.module.margin + this.module.width*2, this.module.margin);
	}

	makeModuleBoxes() {
		let margin = 50;
		let width = 300;
		this.module.width = width;
		this.module.margin = margin;
		let height = Math.max(this.module.prevCells.length, Math.max(this.module.cells.length, this.module.nextCells.length)) * (this.cellHeight + margin);
		let refY = -((20/height + 0.5)*100) + '%';

		this.module.elNow = new joint.shapes.basic.Rect({
			size: { width: width, height: height },
			position: {x: margin + width, y: margin},
			attrs: { rect: { fill: 'rgba(255, 255, 255, 0)'},
				text: { text: 'This week',
					refY: refY}}
		});

		this.module.elPrev = new joint.shapes.basic.Rect({
			size: { width: width, height: height },
			position: {x: margin, y: margin},
			attrs: { rect: { fill: 'rgba(255, 255, 255, 0)' },
				text: { text: 'Previous topics', refY: refY}}
		});
		this.module.elNext = new joint.shapes.basic.Rect({
			size: { width: width, height: height },
			position: {x: margin + 2*width, y: margin},
			attrs: { rect: { fill: 'rgba(255, 255, 255, 0)' }, text: { text: 'Next topics', refY: refY}}
		});
	}

	makeSVGElement(name, svg) {
		console.log(svg);
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

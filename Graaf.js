class Graaf {
	constructor({cells, edges, domains, modules}) {
		this.cells = cells;
		this.edges = edges;
		this.domains = domains;
		this.modules = modules;
		this.g = this.buildGraph({cells, edges, domains});
	}


	buildGraph({cells, edges, domains}) {
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
			let el = new joint.shapes.standard[c.domain.domain]({
				attrs: {
					image: {
						width: c.name.length * 8,
						height: 40
					},
					label: {
						text: c.name,
					}
				}
			});
			el.resize(c.name.length * 8, 40);
			el.addTo(graph);
			c.element = el;
		});


		for (let i = 0; i < edges.length; i++) {
			let link = new joint.shapes.standard.Link();
			link.source(edges[i].from.element);
			link.target(edges[i].to.element);
			link.addTo(graph);
			edges[i].link = link;
		}

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
			nodeSep: 10,
			edgeSep: 10,
			rankDir: "TB"
		});

	}

	showModule(name) {
		let module = this.modules.find((m) => m.number === state.module);

		this.cells.forEach((c) => {
			if (!module.cells.includes(c)) {
				c.element.remove();
			} else {
				c.element.attr('./filter', {
					name: 'dropShadow',
					args: {
						dx: 2,
						dy: 2,
						blur: 3
					}
				});
			}
		});

		this.edges.forEach((e) => {
			let isFrom = module.cells.includes(e.from);
			let isTo = module.cells.includes(e.to);
			if (isFrom) {
				e.to.element.addTo(this.g);
			} else if (isTo) {
				e.from.element.addTo(this.g);
			}
			if ((isFrom || isTo) && !(isFrom && isTo)) {
				e.link.addTo(this.g);
			}
		});

		let graphBBox = joint.layout.DirectedGraph.layout(this.g, {
			nodeSep: 20,
			edgeSep: 20,
			rankDir: "TB"
		});
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

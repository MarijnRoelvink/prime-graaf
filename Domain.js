class Domain {
    constructor({domain, svg, color}) {
        this.domain = domain;
        this.svg = svg;
        this.color = color;
        this.cell = new Cell({name: domain, domain: this});
    }

	makeElement(graph, width, height) {
		this.cell.makeElement(graph, width, height);
		this.cell.element.remove();
	}
}
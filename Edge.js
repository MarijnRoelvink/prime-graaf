class Edge {
    constructor({from, to}) {
        this.from = from;
        this.to = to;
        this.link = {};
    }

    makeLink(graph, addToGraph = true) {
        let link = new joint.shapes.standard.Link();
        link.source(this.from.element);
        link.target(this.to.element);
        link.attr('line/stroke', this.from.domain.color);
        // link.router('metro', {
        // });
        if(addToGraph) {
            link.addTo(graph);
        }
        this.link = link;
    }
}
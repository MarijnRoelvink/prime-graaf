class Cell {
    constructor({name, domain}) {
        this.name = name;
        this.domain = domain;
        this.element = {};
    }
}

class Edge {
    constructor({from, to}) {
        this.from = from;
        this.to = to;
        this.link = {};
    }
}

class Domain {
    constructor({domain, svg}) {
        this.domain = domain;
        this.svg = svg;
    }
}
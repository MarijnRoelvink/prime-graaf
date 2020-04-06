class Cell {
    constructor({name, domain}) {
        this.name = name;
        this.domain = domain;
        this.element = {};
        this.width = 0;
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
    constructor({domain, svg, color}) {
        this.domain = domain;
        this.svg = svg;
        this.color = color;
    }
}

class Module {
    constructor(module) {
        this.number = parseInt(module.number);
        this.title = module.title;
        this.cells = Object.values(module).slice(2).filter((v) => v !== "");
        this.prevCells = [];
        this.nextCells = [];
        this.elNow = {};
        this.elPrev = {};
        this.elNext = {};
        this.width = 0;
        this.margin = 0;
    }
}
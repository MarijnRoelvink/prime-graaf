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

class Module {
    constructor(module) {
        this.number = parseInt(module.number);
        this.title = module.title;
        this.cells = Object.values(module).slice(2).filter((v) => v !== "");
        this.elNow = {};
        this.elPrev = {};
        this.elNext = {};
    }
}
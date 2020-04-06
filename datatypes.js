class Cell {
    constructor({name, domain}) {
        this.name = name;
        this.domain = domain;
        this.element = {};
        this.width = 0;
        this.height = 0;
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
        this.height = 0;
        this.margin = 0;
    }

    makeModuleBoxes() {
        this.width = 300;
        this.margin = 50;
        this.height = Math.max(this.prevCells.length, Math.max(this.cells.length, this.nextCells.length)) * (this.cells[0].height + this.margin);

        this.elPrev = this.makeBox(0, 'Previous topics');
        this.elNow = this.makeBox(this.width, 'This week');
        this.elNext = this.makeBox(this.width*2, 'Next topics');
    }

    makeBox(xOffset, text) {
        let refY = -((20/this.height + 0.5)*100) + '%';

        return new joint.shapes.basic.Rect({
            size: { width: this.width, height: this.height },
            position: {x: this.margin + xOffset, y: this.margin},
            attrs: { rect: { fill: 'rgba(255, 255, 255, 0)' }, text: { text: text, refY: refY}}
        });
    }

    addEdgeIfRelated(e) {
        let isFrom = this.cells.includes(e.from);
        let isTo = this.cells.includes(e.to);
        if (isFrom && !isTo) {
            this.nextCells.push(e.to);
        } else if (isTo && !isFrom) {
            this.prevCells.push(e.from);
        }
    }
}
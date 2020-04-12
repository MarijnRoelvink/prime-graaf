class Lecture {
    constructor(lecture) {
        this.number = parseInt(lecture.number);
        this.title = lecture.title;
        this.cells = Object.values(lecture).slice(2).filter((v) => v !== "");
        this.prevCells = [];
        this.nextCells = [];
        this.elNow = {};
        this.elPrev = {};
        this.elNext = {};
        this.width = 0;
        this.height = 0;
        this.margin = 0;
    }

    cellIsRelated(c) {
        return (this.cells.includes(c) || this.prevCells.includes(c) || this.nextCells.includes(c));
    }

    edgeIsRelated(e) {
        return this.cells.includes(e.from) || this.cells.includes(e.to);

    }

    makeCellsGlow() {
        this.cells.forEach((c) => {
            c.element.attr('./filter', {
                name: 'highlight',
                args: {
                    color: '#70AB37',
                    width: 6,
                    opacity: 1,
                    blur: 5
                }
            });
        });
    }

    makeLectureBoxes() {
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

    addEdgeEndIfRelated(e) {
        let isFrom = this.cells.includes(e.from);
        let isTo = this.cells.includes(e.to);
        if (isFrom && !isTo) {
            this.nextCells.push(e.to);
        } else if (isTo && !isFrom) {
            this.prevCells.push(e.from);
        }
    }
}
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

	orderForLayout() {
		let counts = this.cells.map((c) => {
			return {cell: c, count: c.outGoingEdges.filter(e => this.cells.includes(e.to)).length}
		});
		this.cells = counts.sort((c1, c2) => c2.count - c1.count).map((c) => c.cell);

		let orderFittingly = (cells, edgekey, directionkey) => {
			let res = cells.map(c => {
				let count = this.cells.length;
				let cellsHit = new Array(this.cells.length).fill(0);
				c[edgekey].forEach(cm => {
					let index = this.cells.indexOf(cm[directionkey]);
					if (index !== -1) {
						cellsHit[index] = 1;
						count = Math.min(count, index);
					}
				});
				let lowestIndex = count;
				count = 10 ** (this.cells.length - lowestIndex);
				for (let i = lowestIndex + 1; i < cellsHit.length; i++) {
					count -= cellsHit[i];
				}
				return {cell: c, count: count}
			});
			return res.sort((c1, c2) => c2.count - c1.count).map((c) => c.cell);
		};

        this.prevCells = orderFittingly(this.prevCells, "outGoingEdges", "to");

        this.nextCells = orderFittingly(this.nextCells, "inComingEdges", "from");
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
		this.elNow = this.makeBox(this.width, 'This lecture');
		this.elNext = this.makeBox(this.width * 2, 'Next topics');
	}

	makeBox(xOffset, text) {
		let refY = -((20 / this.height + 0.5) * 100) + '%';

		return new joint.shapes.basic.Rect({
			size: {width: this.width, height: this.height},
			position: {x: this.margin + xOffset, y: this.margin},
			attrs: {rect: {fill: 'rgba(255, 255, 255, 0)'}, text: {text: text, refY: refY}}
		});
	}

	addEdgeEndIfRelated(e) {
		let isFrom = this.cells.includes(e.from);
		let isTo = this.cells.includes(e.to);
		if (isFrom && !isTo && !this.nextCells.includes(e.to)) {
			this.nextCells.push(e.to);
		} else if (isTo && !isFrom && !this.prevCells.includes(e.from)) {
			this.prevCells.push(e.from);
		}
	}
}
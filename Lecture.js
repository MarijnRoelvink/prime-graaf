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
		this.margin = {
			x: 0,
			y: 0
		};
		this.padding = {
			x: 0,
			y: 0
		}
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

		this.cells.forEach(c => {
			c.element.toFront();
		})
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

	positionCells(cells, x, y, transitionTime) {
		for (let i = 0; i < cells.length; i++) {
			if(transitionTime > 0) {
				cells[i].moveTo(x + this.padding.x, this.padding.y + y + (cells[i].height + this.padding.y) * i, transitionTime);
			} else {
				cells[i].element.position(x + this.padding.x, this.padding.y + y + (cells[i].height + this.padding.y) * i);
			}
		}
	}

	removeLectureBoxes() {
		this.cells.forEach((c) => {
			this.elNow.unembed(c.element);
		});

		this.nextCells.forEach((c) => {
			this.elNext.unembed(c.element);
		});

		this.prevCells.forEach((c) => {
			this.elPrev.unembed(c.element);
		});

		this.elNow.remove();
		this.elPrev.remove();
		this.elNext.remove();
	}

	makeLectureBoxes(paper, scale) {
		this.width = 300;

        this.padding = {
            x: (this.width - this.cells[0].width) / 2,
            y: 40
        };
		this.height = Math.max(this.prevCells.length, Math.max(this.cells.length, this.nextCells.length)) * (this.cells[0].height + this.padding.y) + this.padding.y;

        this.margin = {
            x: (paper.options.width/scale.s - 3 * this.width) / 2,
            y: 100
        };

		this.elPrev = this.makeBox(0, 'Previous topics');
		this.elNow = this.makeBox(this.width, 'This lecture');
		this.elNext = this.makeBox(this.width * 2, 'Next topics');
	}

	makeBox(xOffset, text) {
		let refY = -((20 / this.height + 0.5) * 100) + '%';

		return new joint.shapes.basic.Rect({
			size: {width: this.width, height: this.height},
			position: {x: this.margin.x + xOffset, y: this.margin.y},
			attrs: {
				rect: {
					fill: 'rgba(255, 255, 255, 0)',
					style: {'pointer-events': 'none'}
				},
				text: {
					text: text,
					refY: refY,
					fontFamily: 'Computer Modern Bright',
					fontSize: '20px',
					fontWeight: 'bold'
				}
			}
		});
	}

	updatePosition() {
		this.elPrev.position(this.margin.x, this.margin.y);
		this.elNow.position(this.margin.x + this.width, this.margin.y);
		this.elNext.position(this.margin.x + this.width*2, this.margin.y);
		this.positionCells(this.prevCells, this.margin.x, this.margin.y, 0);
		this.positionCells(this.cells, this.margin.x + this.width, this.margin.y, 0);
		this.positionCells(this.nextCells, this.margin.x + this.width * 2, this.margin.y, 0);

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
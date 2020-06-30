class Cell {
    constructor({name, domain}) {
        this.name = name;
        this.domain = domain;
        this.outGoingEdges = [];
        this.inComingEdges = [];
        this.element = {};
        this.width = 0;
        this.height = 0;
        this.pos = {x: 0, y: 0};
    }

    matchesElement(el) {
        let name = el.attrs.label.text.replace(/[\n ]/g, '');
        return this.name.replace(/ /g, '') === name;
    }

    makeElement(graph, width, height) {
        this.height = height;
        this.width = width;

        let wraptext = joint.util.breakText(this.name, {
            width: this.width*0.8
        });
        let el = new joint.shapes.standard[this.domain.domain]({
            attrs: {
                image: {
                    width: this.width,
                    height: this.height,
                    marginTop: '20px'
                },
                label: {
                    text: wraptext,
                    fontFamily: 'Computer Modern Bright',
                    fontSize: '20px'
                }
            }
        });
        el.resize(this.width, this.height);
        el.addTo(graph);
        this.element = el;
    }

    moveTo(x, y, transitionTime) {
        this.element.transition('position/x', x, {
            delay: 0,
            duration: transitionTime,
            timingFunction: joint.util.timing.linear,
            valueFunction: function(a, b) { return function(t) { return a + (b - a) * t }}
        });
        this.element.transition('position/y', y, {
            delay: 0,
            duration: transitionTime,
            timingFunction: joint.util.timing.linear,
            valueFunction: function(a, b) { return function(t) { return a + (b - a) * t }}
        });
    }
}
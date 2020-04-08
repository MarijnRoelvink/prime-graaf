class Cell {
    constructor({name, domain}) {
        this.name = name;
        this.domain = domain;
        this.element = {};
        this.width = 0;
        this.height = 0;
    }

    makeElement(graph, width, height) {
        this.height = height;
        this.width = width;

        let wraptext = joint.util.breakText(this.name, {
            width: this.width
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
                }
            }
        });
        el.resize(this.width, this.height);
        el.addTo(graph);
        this.element = el;
    }
}

function init() {
    getGraph((graph) => {
            console.log(graph);
            showGraph(graph);
        });
    console.log(joint.version);
}

function makeSVGElement(name, svg) {
    joint.dia.Element.define('standard.' + name, {
        attrs: {
            image: {
                'xlink:href': 'data:image/svg+xml;base64,' + btoa(svg)
            },
            label: {
                textVerticalAnchor: 'middle',
                textAnchor: 'middle',
                refX: '50%',
                refY: '50%',
                fontSize: 14,
                fill: 'black'
            }
        }
    }, {
        markup: [{
            tagName: 'image',
            selector: 'image',
        }, {
            tagName: 'text',
            selector: 'label'
        }]
    });
}

function showGraph({cells, edges, domains}) {
    let graph = new joint.dia.Graph;

    let paper = new joint.dia.Paper({
        el: document.getElementById('graaf'),
        model: graph,
        width: window.innerWidth*2,
        height: window.innerHeight,
        gridSize: 1
    });

    domains.forEach((d) => {
        makeSVGElement(d.domain, d.svg);
    });

    cells.forEach((c) => {
        let el = new joint.shapes.standard[c.domain.domain]({
            attrs: {
                image: {
                    width: c.name.length*8,
                    height: 40
                },
                label: {
                    text: c.name,
                }
            }
        });
        el.resize(c.name.length*8, 40);
        el.addTo(graph);
        c.element = el;
    });


    for(let i = 0; i < edges.length; i++) {
        let link = new joint.shapes.standard.Link();
        link.source(edges[i].from.element);
        link.target(edges[i].to.element);
        link.addTo(graph);
        edges[i].link = link;
    }

    let graphBBox = joint.layout.DirectedGraph.layout(graph, {
        nodeSep: 10,
        edgeSep: 10,
        rankDir: "TB"
    });

}
init();
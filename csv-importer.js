function getGraph(callback) {
    getDomains((domains) => {

        getCells((cells) => {
            cells.forEach((c) => {
                let domain = c.domain;
                c.domain = domains.find((d) => d.domain === domain);
            });

            getModules((modules) => {
                modules.forEach((m) => {
                    m.cells = m.cells.map((mc) => {
                        return cells.find((c) => c.name === mc);
                    });
                });

                getEdges((edges) => {
                    edges.forEach((e) => {
                        let from = e.from;
                        let to = e.to;
                        e.from = cells.find((c) => c.name === from);
                        e.to = cells.find((c) => c.name === to);
                    });
                    callback({cells: cells, domains: domains, edges: edges, modules: modules});
                });
            });
        });
    });
}

function getDomains(callback) {
    getData("resources/domains.csv", Domain, callback);
}

function getCells(callback) {
    getData("resources/cells.csv", Cell, callback);
}

function getEdges(callback) {
    getData("resources/edges.csv", Edge, callback);
}

function getModules(callback) {
    getData("resources/modules.csv", Module, callback);
}

function getData(url, datatype, callback) {
    $.get(url, function (data) {
        $.csv.toObjects(data, {separator: ";"},
            (err, csvData) => {
                csvData = csvData.map((row) => {
                    return new datatype(row);
                });
                callback(csvData);
            });
    });
}

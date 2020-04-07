function getGraph(callback) {
    getDomains((domains) => {

        getCells((cells) => {
            cells.forEach((c) => {
                let domain = c.domain;
                c.domain = domains.find((d) => d.domain === domain);
            });

            getLectures((lectures) => {
                lectures.forEach((m) => {
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
                    callback({cells: cells, domains: domains, edges: edges, lectures: lectures});
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

function getLectures(callback) {
    getData("resources/lectures.csv", Lecture, callback);
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

class CSVImporter {
	constructor(dir) {
		this.dir = dir;
	}

	getGraph(callback) {
		this.getDomains((domains) => {
			this.getDomainEdges((dedges) => {
				dedges.forEach((de) => {
					let from = de.from;
					let to = de.to;
					de.from = domains.find((d) => state.compareStr(from, d.domain)).cell;
					de.to = domains.find((d) => state.compareStr(to, d.domain)).cell;
					de.from.outGoingEdges.push(de);
					de.to.inComingEdges.push(de);
				});
				this.getCells((cells) => {
					cells.forEach((c) => {
						let domain = c.domain;
						c.domain = domains.find((d) => state.compareStr(d.domain, domain));
					});
					this.getLectures((lectures) => {
						lectures.forEach((m) => {
							m.cells = m.cells.map((mc) => {
								return cells.find((c) => state.compareStr(c.name, mc));
							});
						});

						this.getEdges((edges) => {
							edges.forEach((e) => {
								let from = e.from;
								let to = e.to;
								e.from = cells.find((c) => state.compareStr(c.name, from));
								e.to = cells.find((c) => state.compareStr(c.name, to));
								e.from.outGoingEdges.push(e);
								e.to.inComingEdges.push(e);
							});
							callback({cells: cells, domains: domains, edges: edges, lectures: lectures});
						});
					});
				});
			});
		});
	}

	getDomains(callback) {
		this.getData(this.dir + "domains.csv", Domain, callback);
	}

	getCells(callback) {
		this.getData(this.dir + "cells.csv", Cell, callback);
	}

	getEdges(callback) {
		this.getData(this.dir + "edges.csv", Edge, callback);
	}

	getDomainEdges(callback) {
		this.getData(this.dir + "d_edges.csv", Edge, callback);
	}

	getLectures(callback) {
		this.getData(this.dir + "lectures.csv", Lecture, callback);
	}

	getData(url, datatype, callback) {
		$.get(url, function (data) {
			$.csv.toObjects(data, {separator: ";"},
				(err, csvData) => {
					csvData = csvData.filter(d => Object.values(d)[0] !== "");
					csvData = csvData.map((row) => {
						return new datatype(row);
					});
					callback(csvData);
				});
		});
	}

}
let state = {
	module: 1,
	graaf: null,
};


function init() {
	state.module = parseInt(getUrlQuery("module", 1));
	getGraph((graph) => {
		state.graaf = new Graaf(graph) ;
	});
}

function getUrlQuery(q, defaultV = "") {
	let query = {};
	let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
		query[key] = value;
	});
	if(typeof(query[q]) === "undefined") {
		query[q] = defaultV;
	}
	return query[q];
}


init();
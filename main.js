let state = {
	module: 1,
	graaf: null,
};


function init() {
	state.module = parseInt(getUrlQuery("module", 1));
	getGraph((graph) => {
		state.graaf = new Graaf(graph, state.module) ;
		state.graaf.showAll();
	});
}
function switchView(view, el) {
	$(".nav-link").each(function() {
		$(this).removeClass("active");
	});
	$(el).addClass("active");
	state.graaf.switchView(view);
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
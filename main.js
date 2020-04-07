let state = {
	lecture: 1,
	graaf: null,
};


function init() {
	state.lecture = parseInt(getUrlQuery("lecture", 1));
	getGraph((graph) => {
		state.graaf = new Graaf(graph, state.lecture);
		state.graaf.showLecture();
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
let state = {
	lecture: 1,
	graaf: null,
	editmode: false,
	dir: "resources/"
};


function init() {
	state.lecture = parseInt(getUrlQuery("lecture", 1));
	state.editmode = !!parseInt(getUrlQuery("editmode", 0));
	let view = getUrlQuery("view", "lecture");
	document.getElementById("save-layout").hidden = !state.editmode;
	new CSVImporter(state.dir).getGraph((graph) => {
		let div = document.getElementById('graaf');
		div.style.setProperty("filter", "opacity(0)");
		state.graaf = new Graaf(graph, state.lecture);
		state.graaf.getLayout(state.dir, () => {
			switchView(view, document.getElementById(view));
			div.style.setProperty("filter", "none");
			document.getElementById("loading").hidden = true;
		});
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
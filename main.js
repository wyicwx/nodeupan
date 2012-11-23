var routing = require("routing"),
	config = require("./config.js"),
	router = require("./router.js");

router(routing);

routing.configure({
	controller_default:"upload",
	debug:0
})
routing.listen(config.sitePort);

console.log("nodeupan!");
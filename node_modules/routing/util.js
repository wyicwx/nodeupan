var Routing = global.Routing;
var util = Routing.util = {};
var config = require("./config.js");
var path = require("path");

//绝对路径require
util.require = function(paths) {
	paths = config.rootPath + "/" + paths;
	paths = path.normalize(paths);
	return require(paths);
}

//继承函数
util.expend = function(sub,sup) {
	var F = function() {};
	F.prototype = sup.prototype;
	sub.prototype = new F();
}
exports.formatSize = function(size) {
	var sizeMB = size/1024/1024;
	return sizeMB;
}
exports.expend = function(sub,sup) {
	var F = function() {};
	F.prototype = sup.prototype;
	sub.prototype = new F();
}
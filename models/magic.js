function magic() {}

var proto = magic.prototype;

//magic set function
proto.set = function(key,value) {
	if(key in this) {
		this[key] = value;
		return true;
	}
	if("_"+key in this) {
		this["_"+key] = value;
		return true;
	}
	return false;
}
//magic get function 
proto.get = function(key) {
	if(typeof this[key] != "undefined") {
		return this[key];
	}
	if(typeof this["_"+key] != "undefined") {
		return this["_"+key];
	}
}

module.exports = magic;
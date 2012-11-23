//_StringBuffer构造函数原型方法
function _StringBuffer (str) {
	if(str instanceof String) {
		this._string = new Array(str);
	} else if(str instanceof Array) {
		this._string = new Array();
		var temp = this;
		str.forEach(function(param) {
			temp.append(param);
		})
	} else {
		this._string = new Array();
	}
};
//_StringBuffer原型方法

_StringBuffer.prototype.append = function(str) {
	this._string.push(str);
	return this;
};

_StringBuffer.prototype.prepend = function(str) {
	this._string.shift(str);
	return this;
};

_StringBuffer.prototype.join = function(str) {
	if(str) {
		return this._string.join(str);
	} else {
		return this._string.join("");
	}
};

_StringBuffer.prototype.remove = function(str) {
	var temp = new _StringBuffer();
	str = str||'';
	for(var i in this._string) {
		if(this._string[i] != str) {
			temp.append(this._string[i]);
		}
	};
	return temp;
};

_StringBuffer.prototype.getArray = function() {
	return this._string;
}
_StringBuffer.prototype.toString = _StringBuffer.prototype.join;

module.exports = function(str) {
	return new _StringBuffer(str);
}


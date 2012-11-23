var File = global.Routing.util.require("/models/file.js"),
	db = global.Routing.util.require("/models/db.js").db,
	config = global.Routing.util.require("/config.js"),
	fs = require("fs"),
	mongoskin = require("mongoskin"),
	ezcrypto = require("ezcrypto").Crypto;

// ensureIndex
(function() {
	db.collection("file").ensureIndex({"gridFsId":1},{"unique":true});
})();

function FileMapper(file) {
	file = file||{};
	this._file = new File(file);
	this._uploadPath = file.path;
}

var proto = FileMapper.prototype;

proto._getFileCollection = function() {
	return db.collection("file");
}

proto.getPath = function() {
	return this._uploadPath;
}

proto.getFileObj = function() {
	return this._file;
}

proto.save = function(fn) {
	var collection = this._getFileCollection();
	var that = this;
	collection.insert(this._file,function(err,data) {
		if(err) throw err;
		data = data[0];
		var id = data._id;
		that.getFileObj().set("gridFsId",that.getGridFsId(id));
		that.getFileObj()["_id"] = id;
		fn()
	});
}

proto.updateGridFsidAndGid = function() {
	var collection = this._getFileCollection();
	var that = this;
	var id = this.getFileObj().get("id");
	collection.update({"_id":id},{"$set":{"gridFsId":this.getFileObj().get("gridFsId"),"gid":this.getFileObj().get("gid")}},function(err,data) {
		//TODO
	})
}

proto.updateGridFsidByGridFsid = function(newid,fn) {
	var collection = this._getFileCollection();
	var that = this;
	var gridfsid = this.getFileObj().get("gridFsId");
	collection.update({"gridFsId":gridfsid},{"$set":{"gridFsId":newid}},function(err,data) {
		if(err) throw err;
		if(fn) fn(data);
	})
}

proto.findFileByGridFsid = function(gridfsid,fn) {
	var collection = this._getFileCollection();
	collection.findOne({"gridFsId":gridfsid},function(err,data) {
		if(err) throw err;
		console.log(data);
		if(data) fn(true); else fn(false);
	})
}
//删除文档
proto.remove = function() {
	var collection = this._getFileCollection();
	collection.remove(this._file);
}

proto.getFileInfor = function(gridfsid,fn) {
	var collection = this._getFileCollection();
	collection.findOne({"gridFsId":gridfsid},function(err,data) {
		if(err) throw err;
		fn(data);
	});
}

proto.getFileCount = function(fn) {
    var collection = this._getFileCollection();
    collection.count(function(err,data) {
        if(err) throw err;
        fn(data);
    });
}

//六十四位进制数
var base64 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "+", "*"];
proto.getGridFsId = function(gridfsid) {
	//"_id" : ObjectId("4fc3ff980bea9ed5be0840ca")   20位
	//取后8个字母(32位)化成30位,取每六位化成64进制
	gridfsid = gridfsid.toString();
	gridfsid = ezcrypto.MD5(gridfsid);
	var index = gridfsid.match(/\w{8}$/)[0];
	var out = [];
	var temp;
	index = 0x00FFFFFF & ("0x"+index);
	for(var i=0;i < 4;i++) {
		temp = 0x0000002F & index;
		out.push(base64[temp]);
		index = index >> 6;
	} 
	return out.join("");
}

proto.getFile = function(gridfsid,fn) {
	var collection = this._getFileCollection();
	collection.findOne({"gridFsId":gridfsid},function(err,data) {
		fn(err,data);
	})
}

//删除Temp文件
proto.unlink = function() {
	var path = this.getPath();
	fs.unlink(path);
}

//完全删除文件
proto.delFile = function() {
	var currentTime = new Date();
    var dealineTime = currentTime - config.deleteTime*24*60*60*1000;
    dealineTime = new Date(dealineTime);
	var collection = this._getFileCollection();
	collection.remove({"uploadDate":{"$lt":dealineTime}},function() {});
}

module.exports = FileMapper;

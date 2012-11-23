var Magic = global.Routing.util.require("/models/magic.js");

function File(obj) {
	this.size = obj.size||0;
	this.name = obj.name||"templename";
	this.type = obj.type||null;
	this.gridFsId = obj.gridFsId||0;
    this.gid = 0||obj.gid;
    this.uploadDate = new Date();
}

global.Routing.util.expend(File,Magic);

module.exports = File;
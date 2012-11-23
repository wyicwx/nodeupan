var config = global.Routing.util.require("/config.js"),
	mongoskin = require("mongoskin"),
	mongodb = global.Routing.util.require("/node_modules/mongoskin/node_modules/mongodb"),
	Grid = mongodb.Grid;

var url;

if(!config.databaseUser) {
	url = config.databaseHost + ":" +
	  config.databasePort + "/" +
	  config.databaseDB;
} else {
	url = config.databaseUser + ":" +
	  config.databasePassword + "@" +
	  config.databaseHost + ":" +
	  config.databasePort + "/" +
	  config.databaseDB;
}

var db = mongoskin.db(url);

exports.db = db;
exports.Grid = Grid;
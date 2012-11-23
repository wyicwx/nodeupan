var Grid = global.Routing.util.require("/models/db.js").Grid,
    db = global.Routing.util.require("models/db.js").db,
    fs = require("fs"),
    EventProxy = require("eventproxy").EventProxy,
    config = global.Routing.util.require("/config.js");

function GridFs(path,name) {
    this._path = path||null;
    this._filename = name||"templename";
}

var proto = GridFs.prototype;

proto.save = function(fn) {
    var proxy = new EventProxy();
    var path = this._path;
    var name = this._filename;

    var render = function(buffer,grid) {
        grid.put(buffer,{filename:name},function(err,data) {
            if(err) throw new Error("db");
            fn(err,data);
        });
    }

    proxy.assign("buffer","grid",render);


    fs.readFile(path, function (err, data) {
        if (err) throw err;
        proxy.trigger("buffer",data);
    });

    db.open(function(err,db) {
        var grid = new Grid(db, 'fs');
        proxy.trigger("grid",grid);
    })
}

proto.read = function(gid,fn) {

    db.open(function(err,db) {
        var grid = new Grid(db, 'fs');
        grid.get(gid,function(err,data) {
            fn(err,data);
        })
    })
}

proto.delFile = function() {
    var currentTime = new Date();
    var dealineTime = currentTime - config.deleteTime*24*60*60*1000;
    dealineTime = new Date(dealineTime);
    var collection = db.collection("fs.files");
    var proxy = new EventProxy();

    var render = function(data,grid) {
        if(!data|| data.length <1) {
            return false;
        }
        console.log("deleteFile at "+ new Date());
        for(var i in data) {
            grid.delete(data[i]._id,function() {})
        }
    }

    proxy.assign("data","grid",render);

    collection.find({"uploadDate":{"$lt":dealineTime}}).toArray(function(err,data) {
        proxy.trigger("data",data);
    })

    db.open(function(err,db) {
        var grid = new Grid(db, 'fs');
        proxy.trigger("grid",grid);
    })
}

module.exports = GridFs;


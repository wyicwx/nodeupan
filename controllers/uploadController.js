var EventProxy = require("eventproxy").EventProxy,
    config = global.Routing.util.require("/config.js"),
    util = global.Routing.util.require("/lib/util.js");

exports.indexAction = function(req,res) {
    var Model_FileMapper = new global.Routing.models.Model_FileMapper();
    Model_FileMapper.getFileCount(function(data) {
        if(data > 0) {
            data = "服务器上已经存放了"+data+"个文件了哦！快来试试吧！";
        } else {
            data = "";
        }
        return res.template({config:config,layout:false,filedata:data});
    })
}

exports.uploadAction = function(req,res) {
    var file = req.files.file;
    if(!file) {
        return res.end();
    }
    var Model_FileMapper = new global.Routing.models.Model_FileMapper(file);
    if(util.formatSize(file.size) > config.uploadFileSize) {
        Model_FileMapper.unlink();
        res.writeHead(200,{
            'Content-Type':'text/html'
        })
        return res.end("ERROR_UPLOAD_SIZE");
    }
    
    var Model_GridFs = new global.Routing.models.Model_GridFs(Model_FileMapper.getPath(),file.name);
    var proxy = new EventProxy();

    var render = function(fdata,gdata,ferr,gerr) {
        if(ferr||gerr) {
            //TODO
            res.end("ERROR_DB_FAIL");
        } else {
            var fileobj = Model_FileMapper.getFileObj();
            fileobj.set("gid",gdata._id);
            //更新数据库信息
            Model_FileMapper.updateGridFsidAndGid();
            //删除临时文件
            Model_FileMapper.unlink();
            //设置session
            req.session.code = fileobj.get("gridFsId");
            res.writeHead(200,{
                'Content-Type':'text/html'
            })
            res.end(fileobj.get("gridFsId").toString());
        }
    }

    proxy.assign("fdata","gdata","ferr","gerr",render);

    Model_FileMapper.save(function(err,data) {
        proxy.trigger("ferr",err);
        proxy.trigger("fdata",data);
    });

    Model_GridFs.save(function(err,data) { 
        proxy.trigger("gerr",err);
        proxy.trigger("gdata",data);
    });
}

exports.customCodeAction = function(req,res) {
    var newcode = req.body.code;
    //长度限制
    if(newcode.length < 4 || newcode.length > 12) {
        return res.end("ERROR_LENGTH");
    }
    //格式限制
    if(newcode.match(/[1-9a-zA-Z+*]*/).join("") != newcode) {
        return res.end("ERROR_FORMAT");
    }
    //读取之前上传的code
    var code = req.session.code||null;
    if(!code) {
        return res.end("ERROR_NOTEXIST");
    }
    var Model_FileMapper = new global.Routing.models.Model_FileMapper({"gridFsId":code});

    Model_FileMapper.findFileByGridFsid(newcode,function(data) {
        if(data) {  //已经存在
            return res.end("ERROR_EXIST");
        } else {
            Model_FileMapper.updateGridFsidByGridFsid(newcode);
            req.session.code = newcode;
            return res.end(newcode);
        }
    })
    
}

exports.helpAction = function(req,res) {
    return res.template({config:config,layout:false});
}

//定时删除
var Model_FileMapper = new global.Routing.models.Model_FileMapper();
var Model_GridFs = new global.Routing.models.Model_GridFs();
setInterval(function() {
    //删除数据库数据
    Model_FileMapper.delFile();
    //删除文件
    Model_GridFs.delFile();
},config.deleteCheck*60*60*1000); 
//删除数据库数据
Model_FileMapper.delFile();
//删除文件
Model_GridFs.delFile();

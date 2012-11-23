var EventProxy = require("eventproxy").EventProxy;


exports.downloadAction = function(req,res) {
	var gridFsId = req.params.d||req.body.code;
	gridFsId = gridFsId.replace(/\s/g,"");
	var Model_FileMapper = new global.Routing.models.Model_FileMapper();
	if(gridFsId.length <4) return res.end();
	Model_FileMapper.getFile(gridFsId,function(err,data) {
		if(err||!data) {
            res.writeHead(200,{
                'Content-Type':'text/html;charset=utf-8'
            });
			return res.end("没有这个文件！");
		} else {
			var Model_GridFs = new global.Routing.models.Model_GridFs();
			Model_GridFs.read(data.gid,function(err,fdata) {
				res.writeHead(200, {
					'Content-Type': 'application/force-download;charset=utf-8',
					'Content-Disposition': 'attachment; filename=' + encodeURI(data.name) });
				res.end(fdata);
			})
		}
	});
}

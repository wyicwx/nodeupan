var download = global.Routing.util.require("/controllers/downloadController.js").downloadAction;

module.exports = function(Routing) {
	Routing.customRoute(function() {
		this.get("/d/:d",download);
	})

	Routing.errorCode['404'] = function(req,res) {
        res.writeHead(200,{
            'Content-Type':'text/html;charset=utf-8'
        })
		var js = '<script type="text/javascript"> location.href = "http://online.hfut.edu.cn/404.php";</script>';
		res.end(js);
	};
}

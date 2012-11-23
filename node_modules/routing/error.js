module.exports = {
	'404':function(req,res,next) {
		var body = '404 Not Found';
		res.writeHead(404, {
  			'Content-Length': body.length,
  			'Content-Type': 'text/plain' 
  		});
		res.end(body);
	},
	'500':function(req,res,next) {
		var body = '500 server error';
			res.writeHead(500, {
	  			'Content-Length': body.length,
	  			'Content-Type': 'text/plain'
			});
			res.end(body);
	}
}

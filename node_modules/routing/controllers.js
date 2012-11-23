var config = require('./index.js').config,
	fs 	   = require('fs'),
	stringBuffer   = require('./lib/libString.js');
	// controllers    = new ControllersFunction();		//存储c下面的所有controllers
	
//controllers对象构造函数
function ControllersFunction() {
	this.controllers = {};
	this.init();
};

var proto = ControllersFunction.prototype;

// 初始化
proto.init = function() {
	this.setController(config.controllersDir);
	// 设置路由
	
}

// 设置Controller
proto.setController = function(dir,obj) {
	var dataFile = this.readDir(dir);
	var obj = obj||this.controllers;
	for(var i in dataFile) {
		if(this.isJs(dataFile[i]) && this.isController(dataFile[i])) {
			obj[this.formatController(dataFile[i])] = {};
			var action = require(dir+"/"+dataFile[i]);
			for(var j in action) {
				if(this.isAction(j)) {
					obj[this.formatController(dataFile[i])][this.formatAction(j)] = action[j];
				}
			}
		} else if(this.isFolder(dataFile[i])) {
			var newobj = obj[config.folderPrefix+dataFile[i]] = {};
			this.setController(dir+"/"+dataFile[i],newobj);
		}
	}
}

//find action route
proto.findAction = function(params) {
	var path = params.path;
	var request = params.request;
	//controller对象
	var controllers = params.controllers||this.controllers;
	if(typeof request.viewPath == 'undefined') request.viewPath = stringBuffer();
	//文件夹判断
	if(path.length >2) {
		if(path[0] in controllers) {
			if(path[1] in controllers[path[0]] && controllers[path[0]][path[1]] instanceof Function) {
				var c = path.shift();
				var a = path.shift();
				var param;
				//存储路径
				request.viewPath.append(c);
				request.viewPath.append(a);
				for(var i=0;i < path.length;i++) {
					param = path.shift();
					request.params[param] = path.shift();
				}
				return controllers[c][a];
			} else {
				throw new Error("404");
			}
		} else if(config.folderPrefix+path[0] in controllers) {
			//Folder TODO
			var url = path.shift();
			//存储路径
			request.viewPath.append(url);
			params.controllers = controllers[url];
			return this.findAction(params);
		} else {
			throw new Error("404");
		}
	} else if(path.length == 2) {
		if(path[0] in controllers) {
			//Controller TODO
			var url = path.shift();
			//存储路径
			request.viewPath.append(url);
			params.controllers = controllers[url];
			return this.findAction(params);
		} else {
			path.push(config.web_default);
			params.controllers = controllers;
			return this.findAction(params);
		}
	} else if(path.length == 1) {
		if(path[0] in controllers && controllers[path[0]] instanceof Function) {
			request.viewPath.append(path[0]);
			return controllers[path[0]];
		} else {
			//添加默认action
			path.push(config.web_default);
			params.controllers = controllers;
			return this.findAction(params);
		}
	} else {
		//添加默认controller
		path.push(config.controller_default);
		return this.findAction(params);
	}
	throw new Error("404");
}

//读取文件夹
proto.readDir = function(dir) {
	var data;
	try {
		data = fs.readdirSync(dir);
	} catch(e) {
		return [];
	}
	return data;
}

// 判断是否是js文件
proto.isJs = function(file) {
	var js = new RegExp(/.js$/);
	return js.test(file);
}
//format js filename
proto.formatJs = function(file) {
	return file.slice(0,-3);
}

// 判断并设置controller文件
proto.isController = function(file) {
	//是否controller js文件检测正则对象
	var controllerFile = new RegExp(config.controllerExtension+"\.js$");
	return controllerFile.test(file);
}

//format controllerfile
proto.formatController = function(file) {
	var length = config.controllerExtension.length;
	file = this.formatJs(file);
	return file.slice(0,-length);
}

// 判断并设置文件夹
proto.isFolder = function(file) {
	//是否文件夹检测正则对象
	var folder = new RegExp(/^[a-z0-9]+$/);
	return folder.test(file);
}

// 判断并设置Action
proto.isAction = function(file) {
	//是否Action
	var action = new RegExp(config.actionExtension + '$');
	return action.test(file);
}

//format action function's name
proto.formatAction = function(file) {
	var length = config.actionExtension.length;
	return file.slice(0,-length);
}

module.exports = ControllersFunction;
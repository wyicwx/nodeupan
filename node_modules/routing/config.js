var config = exports;

//定义默认主页
config.web_default = 'index';

//定义默认controller
config.controller_default = 'index';

//是否开启报错
config.debug = 0;

//root目录路径
config.rootPath = __dirname + '/../..';

//自定义controller对象文件夹前缀
config.folderPrefix = '__dir__';

//自定义所用模板(须自己安装模块)
config.template = 'ejs';

//自定义模板后缀
config.templateExtension = 'html';

//自定义session's hash
config.session_secret = 'Routing';

//自定义生产环境静态文件时间
config.static_maxage = 1000 * 60 * 60 * 24 * 365;

//自定义controller目录
config.controllersDir = config.rootPath + '/controllers';

//自定义controller文件的后缀
config.controllerExtension = 'Controller';

//自定义models目录
config.modelsDir = config.rootPath + '/models';

//自定义views文件夹
config.viewsDir = config.rootPath + '/views';

//自定义action的后缀
config.actionExtension = 'Action';
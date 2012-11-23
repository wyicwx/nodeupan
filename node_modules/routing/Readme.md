#Routing

####介绍

Routing是基于**express**的自动设置路由模块

####关于自动路由

Routing读取controllers文件夹内的xxxController.js文件，并缓存所有action函数

例：

  以下controllers是目录结构
  
    --- controllers/                controllers文件夹
     |---- indexController.js       controller文件
     |     |---- indexAction        action函数
     |     |---- signupAction
     |     |---- ....
     |
     |---- homeController.js
     |---- userController.js
     |---- ....
     |
     |---- topic/
           |---- indexController.js
           |---- ....
           
  以下views是目录结构
  
    --- views/                     views文件夹
     |---- index/                  对应controller的文件夹
     |     |---- index.html        对应action的文件夹
     |     |---- signup.html
     |     |---- layout.html
     |     |---- ....
     |
     |---- home/
     |---- user/
     |---- ....
     |
     |---- topic/
     |     |---- index/
     |     |---- ....



1. 当接受请求为/index/index时，自动路由到indexController.js内的indexAction函数,默认action为index，默认controller为indexController(可修改)

2. 当接受请求为/index/index/id/123/type/submit时，自动路由同上，action函数内可获取参数,使用request.params['id']可以获取得值123，request.params['type']可以获取得值'submit'

3. 自动路由没有找到对应action则抛出404错误转由错误视图控制，详见**错误视图**

4. action函数内可以使用respon.template函数调用对应views下相应视图

####关于错误视图

启用错误视图请确认设置

使用configure设置{"config.debug":0};

任何时刻抛出错误都可以在错误视图中捕获并调用对应视图，默认调用500视图对象

例：throw new Error('404') 会调用已定义的404错误视图

可以用使用routing.errorCode对象自定义视图，默认只有404和500视图

####关于api

**configure**

configure函数可以配置config.js的参数，而不用去修改config.js,参数允许传入一个对象

例：
    routing.configure({
        'web_default':'home',
        'controller_default':'home',
        'debug':1
    })

参数请参阅config.js

注：configure函数需要init函数使用前调用,其他函数须执行init函数后执行

**init**

初始化Routing(必须)

**customRoute**

customRoute函数接受一个函数参数，用于自定义路由，拥有最高优先级，允许多次调用

例：

    routing.customRoute(function() {
    
        this.all('/index/user',function(req,res,next) {
          .........
        }) 
        
        this.post('/:id',function(req,res,next) {
          .........
        })
    })

参数函数内使用this定义路由，定义方法和express定义路由相同，`this.get()|this.post()|this.all()`....

**listen**

listen函数用于配置好后初始化Routing并开启服务routing.listen(80);

**其他变量**

routing.app           存储express的server实例

routing.controllers   存储缓存的controller对象

routing.errorCode     存储存储错误视图对象

注：以上对象需要在调用init函数后使用

####安装和使用

>安装方法 npm install routing

>routing依赖于express  已经依赖了express不需要再安装express

`var routing = require('routing');`

`routing.init();`

`routing.listen(80);`

####其他

>1. Routing已经配置好生产环境(production)和开发环境(development)

>2. 默认存放controller文件夹为/controllers，默认使用ejs模板引擎

>3. 静态文件不会使用到自动路由
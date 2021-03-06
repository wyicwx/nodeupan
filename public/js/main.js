(function($) {
    config = {
        filesize : 20, //10M
        filetime : 7    //7day
    }

    //提示框类
    function Tips() {
        this._init();
        this.bubble = {};
    };
    Tips.prototype = {
        _inited:false,
        _init:function() {
            if(this._inited) {
                return;
            }
            this._inited = true;
        },
        _getBubble:function(msg) {
            if(!this.bubble[msg]) {
                var div = $("<div>");
                div.css({
                    "position":"absolute",
                    "background":"url(images/bubble-sprite.png) no-repeat",
                    "_background":"url(images/bubble-sprite_ie6.gif) no-repeat",
                    "display":"none",
                    "color":"white",
                    "text-align":"center"
                });
                if($.browser.msie&&$.browser.version == 6) {
                    div.css("background","url(images/bubble-sprite_ie6.gif) no-repeat");
                }
                this.bubble[msg] = div;
                $(".j-main").append(div);
                return this.bubble[msg];
            } else {
                return this.bubble[msg];
            }
        },
        hide:function() {
            for(var i in this.bubble) {
                this.bubble[i].hide();
            }
        },
        error:function(msg) {
            this.hide();
            var bubble = this._getBubble("error");
            bubble.css({
                "height": "149px",
                "width" : "150px",
                "background-position" : "-400px -150px",
                "top" : "86px",
                "left" : "587px",
                "line-height" : "149px",
                "font-size" : "30px"
            });
            bubble.html(msg);
            bubble.show();
        },
        waring:function(msg) {
            this.hide();
            var bubble = this._getBubble("waring");
            bubble.css({
                "height": "99px",
                "width" : "130px",
                "background-position" : "-600px -149px",
                "top" : "195px",
                "left" : "205px",
                "font-size" : "16px",
                "padding" : "50px 10px 0px"
            });
            bubble.html(msg);
            bubble.show();
        },
        success:function(msg) {
            this.hide();
            var bubble = this._getBubble("success");
            bubble.css({
                "height": "149px",
                "width" : "150px",
                "background-position" : "-400px -150px",
                "top" : "86px",
                "left" : "587px",
                "line-height" : "149px",
                "font-size" : "30px"
            });
            bubble.html(msg);
            bubble.show();
        },
        waringfile:function(msg) {
            alert(msg);
        },
        waringkey:function(msg) {
            alert(msg);
        },
        waringtips:function(msg) {
            this.hide();
            var bubble = this._getBubble("waringtips");
            bubble.css({
                "height": "109px",
                "width" : "130px",
                "background-position" : "-600px -149px",
                "top" : "195px",
                "left" : "205px",
                "font-size" : "16px",
                "padding" : "40px 10px 0px"
            });
            bubble.html(msg);
            bubble.show();
        }
    }


    //主体框架
    function Upan(option) {
        window.tips = this.tips = new Tips();
        //存储dom元素
        this._dom = {};
        this._currentDom;
        this._currentCode = null;
        //动画锁
        this.showLocked = false;
        //初始化
        this._options = {
            toggleTime:400
        };
        this._init(option);
    };
    Upan.prototype = {
        _inited:false,
        _init:function(option) {
            if(this._inited) {
                return;
            }
            this._getDom();
            this._setOption(option);
            this._inited = true;
            this._bindEvent();
            this._bindAjaxBtn();
            this._bindCustomCode();
            this._bindRecorder();
            this._setCloudPosition();
            this._dom["upload"].css("opacity","1");
        },
        _setCloudPosition:function() {
            //重新调整主框位置
            if(window.screen.height > 800) {
                var height = Math.ceil((window.screen.availHeight - $("#main").height())/3);
                $("#main").css({"position":"absolute","top":height});
            }
        },
        _setOption:function(option) {
            for(var o in this._option) {
                if(option[o]) {
                    this._option = option[o];
                }
            }
        },
        _getDom:function() {
            var that = this;
            //缓存dom
            $(".j-getDom").each(function(index,element) {
                element = $(element);
                var id = element.attr("id");
                that._dom[id] = element;
                //缓存当前显示dom
                if(element.css("display") != "none") {
                    that._currentDom = element;
                }
            })
        },
        _bindRecorder:function() {
            var that = this;
            $(".j-recentUpload").bind("click",function() {
                // if($(this).data("init")) {
                //  that.show("result");
                // } else {
                //  $(this).data("init",true);
                //  
                var data = store.get("upan")||[];
                //if(data.length <1) return;
                var html = "";
                var currenTime = new Date();
                for(var i = data.length - 1;i >= 0;i--) {
                    try {
                        if(currenTime - data[i].date > config.filetime*24*60*60*1000) continue;
                    } catch(e) {}
                    html += '<tr><td><a href="/d/'+data[i].code+'" title="'+data[i].name+'">'+data[i].name+'</a></td><td>'+data[i].code+'</td></tr>';
                }
                $(".j-recoder").html("").append(html);
                that.show("result");
            
            })
            
        },
        _bindEvent:function() {
            var that = this;
            $("#cloud-upload").add(".j-upload-again").bind("click",function() {
                that.show("upload");
            });
            $("#cloud-key").bind("click",function() {
                that.showKey();
            });
            $("#cloud-download").add(".j-godownload").bind("click",function() {
                that.show("download");
            })
            $(".j-custominput").focus(function() {
                that.tips.waringtips("提取码只能使用字母(区分大小写)和数字组合哦！");
            });
            $(".j-custominput").blur(function() {
                that.tips.hide();
            });
        },
        _bindAjaxBtn:function() {
            var that = this;
            //上传按钮绑定
            new AjaxUpload($(".j-uploadbtn"), {
                action: '/upload/upload', 
                name: 'file',
                onSubmit : function(file, ext){
                    // If you want to allow uploading only 1 file at time,
                    // you can disable upload button
                    this.disable();
                    //进度条提示
                    that.show("process",true);
                    that._timeout = setTimeout(function() {
                        $(".j-timeTooLong").show();
                    },30*1000);
                },
                onComplete: function(file, response){
                    clearTimeout(that._timeout);
                    this.enable();
                    if(response.match(/ERROR_/)) {
                        switch(response) {
                            case "ERROR_UPLOAD_SIZE":
                                that.tips.waringfile("上传的文件太大！");
                                break;
                            default:
                                that.tips.error("服务器错误");
                        }
                        that.show("upload");
                        return;
                    }
                    that.setKeyCode(response,file);
                    that.show("key");
                }
            });
        },
        _bindCustomCode:function() {
            var that = this;
            $(".j-customcode").bind("click",function() {
                $(".j-customcodeform").toggle(0,function() {
                    if($(".j-upload-again").css("display") == "block") {
                        $(".j-upload-again").hide();
                    } else {
                        $(".j-upload-again").show();
                    }
                
                });
                that.tips.hide();
            })
            $(".j-customcodesubmit").submit(function(e) {
                e.stopPropagation();
                e.preventDefault();
                var code = $(".j-custominput");
                if(code.val() == ""||!code.val()) {
                    $(".j-customcode").click();
                    return false;
                }
                if(code.val().length > 12 || code.val().length < 4) {
                    that.tips.waring("提取码长度不符！要求在4到12个字符之间！");
                    return false;
                }
                if(code.val().replace(/\s/g,"").match(/[1-9a-zA-Z+*]*/).join("") != code.val().replace(/\s/g,"")) {
                    that.tips.waring("提取码格式不对！");
                    return false;
                }
                $.ajax({
                    url:"/upload/customCode",
                    type:"post",
                    data:{
                        code:code.val().replace(/\s/g,"")
                    },
                    success:function(data) {
                        if(data.match(/ERROR_/)) {
                            switch(data) {
                                case "ERROR_EXIST":
                                    that.tips.waring("该提取码已经被使用了哦！换一个吧！");
                                    break;
                                case "ERROR_FORMAT":
                                    that.tips.waring("提取码格式不对！详情请参考帮助！");
                                    break;
                                case "ERROR_NOTEXIST":
                                    that.tips.waring("该提取码不能修改了哦！");
                                    break;
                                case "ERROR_LENGTH":
                                    that.tips.waring("提取码长度不符！要求在4到12个字符之间！");
                                    break;
                                default:
                                    that.tips.error("服务器错误，请重试！");
                                    break;
                            }
                            return;
                        }
                        that.setKeyCode(data);
                        code.val("");
                        $(".j-customcode").click();
                        that.tips.success("修改成功");
                    },
                    onerror:function() {
                        that.tips.error("设置出错，请重试！");
                    }
                });
                return false;
            })
        },
        getDom:function(dom) {      //获取页面上dom元素
            //延迟初始化，提升性能
            this._getDom();
            this.getDom = function(dom) {
                return this._dom[dom];
            }
            return this._dom[dom];
        },
        getCurrentDom:function() {
            return this._currentDom;
        },
        setCurrentDom:function(dom) {
            var dom = this.getDom(dom);
            return this;
        },
        show:function(dom,animate) {
            this.tips.hide();
            var currentDom = this.getCurrentDom();
            if(dom == currentDom.attr("id")||this.showLocked) return;
            dom = this.getDom(dom);
            var that = this;
            var time;
            if(!animate) {
                time = this._options["toggleTime"];
            } else {
                time = 0;
            }
            //动画锁定
            this.showLocked = true;
            //设置透明度
            dom.css("opacity","0");
            //动画
            currentDom.animate({"opacity":"0"},time,function() {
                currentDom.hide().css("opacity","1");
                dom.show().animate({"opacity":"1"},time,function() {
                    //动画解锁
                    that.showLocked = false;
                    //存储当前显示dom
                    that._currentDom = dom;
                })
            })
            return this;
        },
        showKey:function() {
            if(!this._currentCode) {
                this.tips.waringkey("先上传文件才能获取提取码哦");
                return;
            }
            $(".j-upload-again").show();
            $(".j-customcodeform").hide();
            this.show("key");
        },
        setKeyCode:function(code,file) {
            this._currentCode = code;
            $(".j-keycode").html(code);

            var upanStore = store.get("upan")||[];
            if(file) {
                var obj = {
                    name:file,
                    code:code,
                    date:new Date()
                }
            } else {
                var obj = upanStore.pop();
                obj.code = code;
            }
            upanStore.push(obj);
            if(upanStore.length > 10) {
                upanStore.shift();
            }
            store.set("upan",upanStore);

            return this;
        }
    }

    //拖动上传
    function drag(obj) {
        if(!this._apiTest()) {
            return;
        }
        this._init();
        this.upan = obj;
        this.bind($("body"));
    }

    drag.prototype = {
        _init:function() {
            //显示拖动提示
            $(".j-drapTips").show();
        },
        _apiTest:function() {       //检测是否支持本地文件api
            if(window.File && window.FileReader && window.FileList) {
                return true;
            }
            return false;
        },
        _dragEnter:function(e) {
            if(!$(".j-background").length) {
                var bgObject = $("<div class='j-background'></div>")
                            .width((screen&&screen.availWidth)||$(window).width())
                            .height((screen&&screen.availHeight)||$(window).height())
                            .css({
                                "position":"absolute",
                                "top":"0px",
                                "left":"0px",
                                "background":"black",
                                "opacity":"0.8",
                                "z-index":"10000",
                                "text-align":"center",
                                "font-size":"50px",
                                "color":"white"
                            }).html("放开那个鼠标！！！");
                bgObject.bind("click",function() {
                    $(this).hide();
                })
                $(document.body).append(bgObject);
            }
            $(".j-background").css("line-height",window.scrollY*2+$(window).height()+"px");
            $(".j-background").show();
            e.stopPropagation();
            e.preventDefault();
            return false;
        },
        _dragOver:function(e) {
            e.originalEvent.dataTransfer.dropEffect = "copy";
            e.stopPropagation();
            e.preventDefault();
            return false;    
        },
        _dragLeave:function(e) {
            e.stopPropagation();
            e.preventDefault();
            return false;
        },
        uploadFile:function(file) {
            var fd = new FormData();
            var that = this;
            if(file.size > config.filesize*1024*1024) {
                this.upan.tips.waringfile("文件太大！文件大小不要超过"+config.filesize+"M！");
                this.upan.show("upload");
                return false;
            }
            //设置时间检测提示
            this._timeout = setTimeout(function() {
                $(".j-timeTooLong").show();
            },30*1000);
            //进度条提示
            this.upan.show("process",true);
            fd.append("file",file);
            var xhr = new XMLHttpRequest();
            xhr.open("post","/upload/upload",true);
            xhr.onreadystatechange = function() {
                if(xhr.readyState == 4) {
                    //清除时间检测提示
                    clearTimeout(that._timeout);
                    if(xhr.status == 200) {
                        that.upan.setKeyCode(xhr.responseText,file.name);
                        that.upan.show("key");
                    } else {
                        //服务器出错设置
                        that.tips.error("服务器出错，请重试！");
                        that.upan.show("upload");
                        return;
                    }
                }

            }
            xhr.setRequestHeader("X-Requested-With","XMLHttpRequest");
            xhr.send(fd);
            return false;
        },
        bind:function(dom) {
            var that = this;
            dom.live("dragenter", this._dragEnter)
                .live("dragover",  this._dragOver)
                .live("dragleave", this._dragLeave)
                .live("drop", function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    $(".j-background").hide();
                    var files = e.originalEvent.dataTransfer.files;
                    for ( var i = 0; i < files.length; i++){
                        that.uploadFile(files[i]);
                    }
                });
        }

    }

    $(document).ready(function() {
        //
        var upan = new Upan({
            toggleTime:200
        });
        new drag(upan);
    });
})(jQuery);

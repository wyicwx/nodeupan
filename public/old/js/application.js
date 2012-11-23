(function($){
$.ajaxTransport("+*", function(s){    
  var xhr;
  if (s.useXHR2)
    return {
      send: function(headers, complete){   
        xhr = s.xhr();
        xhr.open( s.type, s.url, s.async );
        delete headers["Content-Type"];
        headers[ "X-Requested-With" ] = "XMLHttpRequest";
    
        for ( i in headers ) {
         xhr.setRequestHeader( i, headers[ i ] );
        }
  	
      	var callback = function(e){
      	  var responses = {xml: xhr.responseXML, text: xhr.responseText};
      	  complete( xhr.status, xhr.statusText, responses, xhr.getAllResponseHeaders() );
      	};
  	
      	xhr.addEventListener("load", callback);
      	xhr.addEventListener("error", callback);
  	if (s.progress)
          xhr.addEventListener("progress", s.progress);
        if (s.upload && s.upload.success)
          xhr.upload.addEventListener("load", s.upload.load);
        if (s.upload && s.upload.progress)
          xhr.upload.addEventListener("progress", s.upload.progress);

        xhr.send(s.data);
      },
  
      abort: function(){
        if (xhr) xhr.abort();
      }
  };
});

var defaults = {
	processData: false,
	contentType: false,
	type:        "POST",
	useXHR2:      true,
	upload:      {}
};

$.upload = function(url, data, settings){    
	var fd = new FormData;
	if ( data instanceof File )
	data = {"filename":data.name,"value":data};
	for ( var key in data )
	fd.append(key, data[key]);
	// Last argument can be success callback
	if ( typeof settings == "function" ) {
	settings = {success: settings};
	}
	settings.url  = url;
	settings.data = fd;
	settings = $.extend({}, defaults, settings);
	return $.ajax(settings);
};

//handle drag events;
function dragEnter(e) {
    if($("#draglayer").length == 0)
        $("<div id='draglayer'>").append($("<p id='drop'>").text("放开那个鼠标!")).prependTo($("body"));
	QuickShare.moveTo("left");
    	$(".upspace").hide();
	e.stopPropagation();
	e.preventDefault();
	return false;
};

function dragOver(e) {
	e.originalEvent.dataTransfer.dropEffect = "copy";
	e.stopPropagation();
	e.preventDefault();
	return false;    
};

function dragLeave(e) {
	e.stopPropagation();
	e.preventDefault();
	return false;
};
  
$.fn.dropArea = function(){
	this.live("dragenter", dragEnter)
	    .live("dragover",  dragOver)
	    .live("dragleave", dragLeave);
	return this;
};

//the site code
var QuickShare = QuickShare || {};
QuickShare = {
	initialize:function(){
		this.maxsize = 10;//10M
		this.action = "http://" + window.location.host;
		this.$box = $(".upbox");
		this.html = this.$box.html();
		this.bindEvents();	
		this.initUploadBox();
		this.showRecent();
        this.hideSuggest();
	},
	
	//define the events	
	events:{
		"click #goup":"upload",
		"click #godown":"download",
		"click #again":"backToBegin",
		"dragover document.body":"dragover",
		"mousemove body":"useInput",
		"click #uploadfile":"fileResponse",
		"click .downbutton":"validInput"
	},

	routes:{
       "!/download":"download",    
       "!/upload":"upload"    
	},


	//events callbacks
	upload:function(){
		QuickShare.moveTo("left");
        window.location.hash = "!/upload";
		return false;
	},

	backToBegin:function(){
		var now = QuickShare;
		now.$box.html(now.html);
        	QuickShare.hideSuggest();
		now.applyAjaxFileUpload("input#uploadfile")
	},	
	download:function(){
		QuickShare.moveTo("right");
        window.location.hash = "!/download";
		return false;
	},


	dragover:function(){
		e.stopPropagation();
  		e.preventDefault();
  		return false;
	},
	
	validInput:function(e){		
		var code = $(".downtext").val(),
		    $notice = $("#notice");	
		if(!code){			
		    if($notice.length == 0){
		    	$notice = $("<p style='color:red;margin-left:150px' id='notice'>请输入提取码</p>");
			$notice.appendTo($(".line1")).delay(1000).fadeOut();						
		    }
		    return false;
		}
		//ignore below
		var re = /[^\u4e00-\u9fa5]/; 
		if(!re.test(code)){
		    var im=$("<img/>");
		    im.attr({"id":"jo","src":"../static/image/buff.gif"});
		    im.css({top:"31px",left:"31px",position:"absolute"});
		    $(".announce").append(im);
		    setTimeout(QuickShare.disappear,3000);
	            $(".downtext").val("");
		    return false;
		}else{
		    return true;
		}
	},
	
	moveTo:function(dir){
		switch(dir){
		case "left"  :
			$(".inside").animate({"left":"-720px"},200);
            $(".recentFiles").css({"visibility":"visible"});
			this.backToBegin();
			break;
		case "right":
			$(".inside").animate({"left":"0"},200);
			$(".recentFiles").css({"visibility":"hidden"});
			break;
		}
		return false;
	},	

    hideSuggest:function(){
    	if($.browser.msie||$.browser.opera){  
        		$(".upspace span").hide();
    	}
        $("body a").last().hide();
	},

	observeHash:function(){
        var routes = this.routes;
        var hashValue = window.location.hash.slice(1);
        for(var i in routes){
            var routesCb = routes[i];
            if(hashValue === ""){this.upload()};
            if(hashValue === i){ this[routesCb]()};		
        }
	},

    observeHashChange:function(){
        var self = this;
        this.observeHash();	
        $(window).bind("hashchange", function(){
            self.observeHash();	
        });
    },
		
	bindEvents:function(){
		var events = this.events
		   ,eventArray,eventName,receiver;
		for(var i in events){
			eventArray = i.split(" "),	
			eventName = eventArray[0],
			receiver = eventArray[1],
			callback = events[i];
			$(receiver).live(eventName,this[callback]);
		}
        	this.observeHashChange();
        $("body,html").live("dragleave",function(e){
            if(e.pageX == 0){
                $("#draglayer").remove();
            }
        })
	},
	
	//file upload
	initUploadBox:function(){
		var drop = $("body"),self = this;
		drop.dropArea();
		drop.bind("drop", function(e){ 
			e.stopPropagation();
			e.preventDefault();
            $("#draglayer").remove();
            QuickShare.backToBegin();
			var files = e.originalEvent.dataTransfer.files;
			for ( var i = 0; i < files.length; i++){
				if(files[i].size > QuickShare.maxsize * 1024 * 1024){
                    QuickShare.completeCb("","FileTooLarge");
                    return;
                }
				self.uploadFile(files[i]);
			}
			    
			return false;
		});
        $("#uploadfile").css("opacity",0);
	    this.applyAjaxFileUpload("input#uploadfile")
		this.observeHashChange();
	},

	uploadFile:function(file){
		var self = this;
		if (window.File && window.FileReader && window.FileList) {
			var element = $("<div />")
			   ,bar = $("<div />");
			element.text(file.fileName);
			element.append(bar);			
			$("#progressbar").append(element);
			$(".upbutton").hide();	
			var onProgress = function(e){
			  var per = Math.round((e.position / e.total) * 100);
			  bar.progressbar({value: per});
			};
			
			var onSuccess = function(msg){
			  self.completeCb(file,msg);
			};

			$.upload(QuickShare.action, file, {upload: {progress: onProgress}, success: onSuccess});
		}
	},

	disappear:function(){
		$("#jo").detach();
	},

	applyAjaxFileUpload:function(element){
		var self = this;
		$(element).ajaxfileupload({
			action :QuickShare.action,
			onComplete: self.completeCb
		});
	},
    
  	fileResponse:function(){
		var jokeList={
			text:["angrybug"],
			src:["../static/image/angryBird.gif"]
		};
		for(var i=0;i<jokeList.text.length;i++){
			if($(".downtext").val().toLowerCase()==jokeList.text[i]){
				var im=$("<img/>");
				im.attr({"id":"jo","src":jokeList.src[i]});
			
				$(".announce").append(im);
				setTimeout(QuickShare.disappear,3000);
				$(".downtext").val("");
				return false;
				}
		}	
		return true;	
	},
	
    useInput:function(e){
		var upLeft=$(".upbutton").offset().left;
		var upTop=$(".upbutton").offset().top;
		var inputX=e.clientX;
		var inputY=e.clientY+$(document).scrollTop();
		if(inputX < upLeft-60 || inputX > upLeft+210 || inputY < upTop-70 || inputY > upTop+70){return ;}
		if((inputY<upTop+40)&&(inputY>upTop)&&(inputX>upLeft)&&(inputX<upLeft+195)){
			$(".upbutton").css({background:"url(../static/image/buttonup2.gif) no-repeat",color:"#E7DE92"});
			if(!($.browser.msie && $.browser.version == "6.0")) {
			$("#uploadfile").css({cursor:"pointer"});
			}
		}else{
			$(".upbutton").css({background:"url(../static/image/buttonup.gif) no-repeat",color:"#fff"});
			$("#uploadfile").css({cursor:"auto"});
		}
		if($(".upspace").offset()) {
			var parentLeft=$(".upspace").offset().left;
			var parentTop=$(".upspace").offset().top;
			var finalLeft=inputX-parentLeft-158;
			var finalTop=inputY-parentTop-6;
			var inputY=e.clientY;
			$("#uploadfile").css({left:finalLeft+"px",top:finalTop+"px"});
			QuickShare.onButton=0;
		}
    },

	completeCb:function(file,response){
		var $div = $("<div class='upload-msg'>"),html = "";
		file = typeof(file) == "object" ? file.name : file;
       	if(response.contentType == "application/xml" || response.indexOf("None") > 0 || response.indexOf("nginx") > 0){
		   html = "<p>啊噢，由于某些外太空的不明原因</p>" +
		      "<p>亲爱的，您上传失败了</p>" +
		      "<p>可能是文件已存在或太大，请重命名或压缩后再来一遍吧</p>" +
		      "<input type='button' class='upbutton' value='再来一遍' id='again'>";	
		}
		else if(response == "FileTooLarge"){
		   html = "<p>对不起，您上传失败了</p>" +
		          "<p>文件实在太大了，还是去借个U盘吧</p>" +
		          "<input type='button' class='upbutton' value='再来一遍' id='again'>";	
		}
		else{
		    html = "<p>恭喜您，上传成功！</p>" + 
		       "<p>这个文件的提取码为：<span id='code'>" +  response + 
		       "<p> 提取码的有效期为7天</p>" + 
		       "</p><input type='button' class='upbutton' value='继续上传' id='again'>";
		      QuickShare.storeData(file,response);
		      QuickShare.showRecent();				      
		}					
		$div.html(html);		
		$("#draglayer").remove();			
		$(".upbox").hide().html($div).fadeIn("slow");
	},
	
	storeData:function(file,response){
	    //recent files
	    recent = [];
	    if(store.get("filelist")){
            recent = store.get("filelist").recent;
            recent.unshift({"filename":file,"code":response});
            if(recent.length >= 6){
                 recent.pop();			
            }
		    store.set("filelist",{recent:recent});
	    }else{
		    recent.unshift({"filename":file,"code":response});
		    store.set("filelist",{recent:recent});
	    }	           
	},

	showRecent:function(){		
		if(store.get("filelist")){
		    var infos = store.get("filelist").recent || [],
		    $tds = $(".fileDetail  tbody"),html = "";
	    	for(var i = 0; i < infos.length ; i++){
	        	html += ("<tr><td>"+ this.formatString(infos[i].filename) + "</td><td>" + infos[i].code + "</td></tr>");		  
	    	}
	    	$tds.html(html);
		}else{
            $(".recentFiles").hide(); 
        }
	},

	formatString:function(str){
		var len = 15;
		if(str.length > len){
			return str.substring(0,len) + "...";
		}
		return str;
	}
};

$(function(){
    QuickShare.initialize();		
})

$.fn.ajaxfileupload = function(options) {
    var root = this,interval = null;
    var defaults = {
        onChange: function(file){},
        onComplete: function(file, response){}
    },
    settings = $.extend({}, defaults, options);
    
    this.each(function() {
        var $this = $(this);
        if ($this.is("input") && $this.attr("type") === "file") {
            $this.bind("change", onChange);
        } 		
    });
    
    function onChange(e) {
        var element	= $(e.target),
            file	= filename(element.val()),
            form = $("#upload");
            root.file = file;
        $("#upload").submit();  
        $("iframe[name=test]").bind("load",onComplete);
        checkSize(e);
        //process
        $(".upbutton").hide();
        $("#progressbar").html($("<img src='static/image/bg_line_loading.gif'>"));
    }

    function onComplete (e) {
        var iframe  = $("iframe[name=test]"),
            doc  	= iframe[0].contentDocument ? iframe[0].contentDocument : window.frames[iframe[0].name].document,
            response = doc.body.innerHTML;
        var element	= $(e.target),
            file	= root.file,
            form = $("#upload");
        if (response) {
        } else {
            response = {};
        }
        settings.onComplete.call(element,file, response);
        return;
    }
   
    function checkSize(e){
        var file_size = 0;
        var $file = $("#uploadfile")[0];
        if ( $.browser.msie && !this.files ) {      
            var file_path = $file.value,      
                file_system = new ActiveXObject("Scripting.FileSystemObject"),         
                file = file_system.GetFile (file_path);      
            filefile_size = file.Size;    
        } else {     
            file_size = $file.files[0].size;            
        }      
        if(file_size > QuickShare.maxsize * 1024 * 1024 ){  
             QuickShare.completeCb("","FileTooLarge");
             return;
        }  
    }    

    function filename(filePath) {
        return filePath.replace(/.*(\/|\\)/, "");
    }
    return this;
}
// remove layerX and layerY
var all = $.event.props,
    len = all.length,
    res = [];
while (len--) {
   var el = all[len];
   if (el != 'layerX' && el != 'layerY') res.push(el);
}
$.event.props = res;
})(jQuery);


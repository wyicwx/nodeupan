(function($) {
$(document).ready(function() {

	var button = $(".j-upload");
	var interval;
	var ajaxUpload;
	function bindUpload(button) {
		ajaxUpload = new AjaxUpload(button, {
			action: '/upload/upload', 
			name: 'file',
			onSubmit : function(file, ext){
				if(init) {
					bgObject.hide();
				}
				// If you want to allow uploading only 1 file at time,
				// you can disable upload button
				this.disable();
				$(".j-uploadspace").hide();
				$(".j-upload-msg").hide();
				$(".j-progressbar").show();
				var i = 0;
				interval = setInterval(function() {
					if(i > 6) {
						$(".j-progressbar-msg").html("uploading");
						i = 0;
						return;
					}
					var html = $(".j-progressbar-msg").html();
					html += ".";
					i++;
					$(".j-progressbar-msg").html(html);
				},600);
				//return false;
			},
			onComplete: function(file, response){
				this.enable();
				clearInterval(interval);
				if(!response.match(/ERROR_/)) {
					//success
					var upan = store.get("upan")||[];
					var obj = {
						name:file,
						code:response,
						date:new Date()
					}
					upan.push(obj);
					store.set("upan",upan);
					// enable upload button
					$(".j-uploadspace").hide();
					$(".j-progressbar").hide();
					$(".j-code").html(response);
					$(".j-upload-msg").show();
				} else {
					$(".j-uploadspace").show();
					$(".j-progressbar").hide();
					$(".j-upload-msg").hide();
					switch(response) {
						case "ERROR_UPLOAD_SIZE":
							alert("上传文件太大！");
							break;
						default:
							alert("上传出错！请重试！");
							break;
					}
				}
			}
		});
	}
	bindUpload(button);

	$(".j-godown").click(function() {
		$(".j-inside").animate({"left":"0px"},300);
		return false;
	})
	$(".j-goupload").click(function() {
		$(".j-inside").animate({"left":"-760px"},300);
		return false;
	})

	$(".j-upload-again").click(function() {
		$(".j-upload-msg").hide();
		$(".j-uploadspace").show();
	})

	$(".j-getfile").click(function() {
		var code = $(".j-downtext").val();
		if(code.length < 4) return false;
		//window.open("/download/download/d/"+code);
	})


	//get store code
	var upan = store.get("upan")||[],html="";
	var currentTime = new Date();
	if(upan.length > 0) {
		$(".j-recentFiles").show();
	}
	var j = 0;
	for(var i=upan.length;i > 0;i--) {
		if(currentTime - upan[i-1].date > 7*24*60*60*1000) {
			continue;
		}
		if(j > 4) break;
		j++;
		html += "<tr><td><a href='/d/"+upan[i-1].code+"' title='"+upan[i-1].name+"'>"+upan[i-1].name+"</a></td><td>"+upan[i-1].code+"</td></tr>";
	}
	$(".j-fileDetail").append(html);

	$(".j-codeshow").hover(function() {
		var width = $(".j-customCode").width();
		$(".j-customCode").css({"right":-width,"top":"0px"}).show();
	},function() {
		$(".j-customCode").hide();
	})

	$(".j-customCode").click(function() {
		$(".j-code").hide();
		$(".j-code-modifly").show();
	});

	$(".j-code-modifly").bind("keydown",function(e) {
		if(e.keyCode == 13) {
			var value = $(this).val();
			if(value.length > 12 || value.length < 4) {
				alert("提取码长度不符");
				return;
			} 
			if(value.match(/[1-9a-zA-Z+*]*/).join("") != value) {
				alert("提取码格式不对");
				return;
			}
			$.ajax({
				type:"post",
				url:"/upload/customCode",
				data:{
					code:value
				},
				success:function(data) {
					if(!data.match(/ERROR_/)) {
						$(".j-code").show().html(data);
						$(".j-code-modifly").hide();
						return;
					} else {
						alert(data);
						return;
					}
				}
			})
		}
	})

	if(window.FileReader) {
		$(".j-uploadspace>span").show();
		var init = false;
		var bgObject;
		//拖拽
		$(document).bind("dragenter",function(event) {
			if(!init) {
				bgObject = $("<div>").width($(window).width()).height($(window).height()).css({"position":"absolute","top":"0px","left":"0px","background":"black","opacity":"0.8"});
				bgObject.hide();
				$(document.body).append(bgObject);
				init = true;
				//bindUpload(bgObject);
			}
			bgObject.show();
			event.stopPropagation();
			event.preventDefault();
		})
		$(document).bind("drapover",function(event) {
			event.stopPropagation();
			event.preventDefault();
			debugger;
			return false;
		})
		$(document).bind("dragleave",function(event) {
			event.stopPropagation();
			event.preventDefault();
			return false;
		})
		$(document).bind("dragstart",function(event) {
			event.stopPropagation();
			event.preventDefault();
			return false;
		})
		$(document).bind("dragend",function(event) {
			event.stopPropagation();
			event.preventDefault();
			return false;
		})
		$(document).bind("drop",function(event) {
			debugger;
			if(init) {
				bgObject.hide();
			}
			ajaxUpload._settings.onSubmit.call(ajaxUpload);
			var fd = new FormData();
			var file = event.originalEvent.dataTransfer.files[0];
			if(file.size > 10*1024*1024) {
				ajaxUpload._settings.onComplete.call(ajaxUpload,file.name,"ERROR_UPLOAD_SIZE");
				return false;
			}
			fd.append("file",file);
			var xhr = new XMLHttpRequest();
			xhr.open("post","/upload/upload",true);
			xhr.onreadystatechange = function() {
				if(xhr.readyState == 4 && xhr.status == 200) {
					ajaxUpload._settings.onComplete.call(ajaxUpload,file.name,xhr.responseText);
				}
			}
			xhr.setRequestHeader("X-Requested-With","XMLHttpRequest");
			xhr.send(fd);
			event.stopPropagation();
			event.preventDefault();
			return false;
		})
		$(window).scroll(function() {
			if(init) {
				bgObject = bgObject.width($(window).width()).height($(window).height());
			}
		})
	} else {

	}
})
})(jQuery)



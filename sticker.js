var stickerConfig = {};
stickerConfig.delayTime = 3000;
stickerConfig.setTimeout = false;

/*
 * 댓글 작성시 스티커 토글 : loadStickerList();
 * 대댓글 작성시 : loadStickerList(undefined, parent_comment_srl);
 * 댓글 수정시 : loadStickerList(undefined, false, comment_srl);
*/

function loadStickerList(page, parent_srl, comment_srl){
	var _page = page;
	page = page ? page : 1;
	var $target = jQuery(!parent_srl && !comment_srl ? '.stk_cmt' : '.stk_cmt_reply');


	var alreadyLoadPage = $target.find('.stk_display .sticker_pack').attr('page') || 1;
	if($target.find('.stk_head .sticker_icon').length){
		if(_page === undefined && !$target.find('.stk_display').hasClass('display-toggle')){
			$target.find('.stk_display').addClass('display-toggle');
			return false;
		}

		if(page == alreadyLoadPage){
			$target.find('.stk_display').toggleClass('display-toggle');
			return false;
		}
	}

	exec_json("sticker.getCommentStickerList",{page:page}, function(ret_obj){
		$target.find('.stk_display').hasClass('display-toggle') && $target.find('.stk_display').toggleClass('display-toggle');
		var sticker = ret_obj['sticker'];
		if(page != 1 && !sticker.length){
			return alert('마지막 페이지입니다.'), false;
		}
		var html = '';
		html += '<li class="sticker_icon">';
		html += '<a href="javascript:;" onclick="'+(page==1 ? 'alert(\'첫 번째 페이지입니다.\')' : ('loadStickerList('+(page-1)+', '+(parent_srl ? parent_srl : 'false')+', '+(comment_srl ? comment_srl : 'false')+')'))  +'">';
		html += '<i class="fa fa-angle-left" aria-hidden="true"></i></a></li>';
		var sticker_length = sticker.length;
		for(i in sticker){

			html += '<li class="sticker_image">';
			html += '<a href="javascript:;" onclick="loadSticker('+sticker[i].sticker_srl+', '+(parent_srl ? parent_srl : 'false') +', '+(comment_srl ? comment_srl : 'false')+');">'
			html += '<div title="'+sticker[i].title+'">';
			html += '<img src="'+sticker[i].main_image+'" width="30" height="30">';
			html += "</div>";
			html += '</a>';
			html += "</li>";

		}

		//blank
		for(i=12-sticker_length; i>0; i--){
			html += '<li class="sticker_icon">';
			html += '</li>';
		}
		html += '<li class="sticker_icon"><a href="/sticker"><i class="fa fa-home" aria-hidden="true"></i></a></li>';
		html += '<li class="sticker_icon"><a href="/index.php?mid=sticker&act=dispStickerMylist"><i class="fa fa-cog" aria-hidden="true"></i></a></li>';
		html += '<li class="sticker_icon">';
		html += '<a href="javascript:;" onclick="'+(sticker_length < 12 ? 'alert(\'마지막 페이지입니다.\')' : ('loadStickerList('+(page+1)+', '+(parent_srl ? parent_srl : 'false')+', '+(comment_srl ? comment_srl : 'false')+')')) +'">';
		html += '<i class="fa fa-angle-right" aria-hidden="true"></i></a></li>';

		$target.find('.stk_display .sticker_pack').html(html).attr({
			page: page,
		});
		if(page == 1 && _page === undefined){
			var first_sticker = $target.find('.stk_display .sticker_pack .sticker_image');
			if(first_sticker.length > 0){
				var sticker_srl = first_sticker.eq(0).find('a').attr('onclick').replace(/.*\(([0-9]+).*/, '$1');
				loadSticker(sticker_srl, (parent_srl ? parent_srl : false), (comment_srl ? comment_srl : false));
			}
		}

	});

}

function loadSticker(sticker_srl, parent_srl, comment_srl){
	if(!sticker_srl){
		return alert('스티커 값이 없습니다.'), false;
	}
	var $target = jQuery(!parent_srl && !comment_srl ? '.stk_cmt' : '.stk_cmt_reply');
	var already_exist = $target.find('.stk_display>.stk_body .sticker_'+sticker_srl);

	if(already_exist.length){
		$target.find('.stk_display>.stk_body>ul').hide();
		already_exist.show();
	} else {
		exec_json('sticker.getStickerElemList', {sticker_srl:sticker_srl}, function(ret_obj){
			var stickerImage = ret_obj.stickerImage;
			var html = '';
			html += '<ul class="sticker_'+sticker_srl+'">';
			for(i in stickerImage){
				var image = stickerImage[i];
				html += '<li>';
				html += '<a href="javascript:;" onclick="insertSticker('+sticker_srl+', '+image.sticker_file_srl+', '+(parent_srl ? parent_srl : 'false')+', '+(comment_srl ? comment_srl : 'false')+')" style="background-image:url('+image.url+');" title="'+image.name+'">';
				html += '</a>';
				html += '</li>';
			}
			html += '</ul>';

			$target.find('.stk_display>.stk_body>ul').hide();
			$target.find('.stk_display>.stk_body').append(html);

		});
	}

}

function insertSticker(sticker_srl, sticker_file_srl, parent_srl, comment_srl){

	if(stickerConfig.setTimeout !== false){
		return alert("너무 빠른 시간동안 이모티콘을 등록할 수 없습니다."), false;
	} else {
		stickerConfig.setTimeout = setTimeout(function(){
			stickerConfig.setTimeout = false;
		}, stickerConfig.delayTime);
	}


	var form = jQuery('.cmt_editor>form');
	var mid = form.find('input[name=mid]').val();
	var document_srl = form.find('input[name=document_srl]').val();
	var comment_srl = comment_srl || 0;
	var parent_srl = parent_srl || 0;
	var content = "{@sticker:"+sticker_srl+"|"+sticker_file_srl+"}";

	jQuery.ajax({
		headers: {'Content-Type': 'text/plain'},
		type: 'POST',
		dataType: "text",
		url: '/index.php',
		data: '<?xml version="1.0" encoding="utf-8" ?><methodCall><params><_filter><![CDATA[insert_comment]]></_filter><error_return_url><![CDATA['+window.location.pathname+']]></error_return_url><mid><![CDATA['+mid+']]></mid><document_srl><![CDATA['+document_srl+']]></document_srl>'+(comment_srl ? ('<comment_srl><![CDATA['+comment_srl+']]></comment_srl>') : '')+'<parent_srl><![CDATA['+parent_srl+']]></parent_srl><content><![CDATA['+content+']]></content><use_html><![CDATA[Y]]></use_html><module><![CDATA[board]]></module><act><![CDATA[procBoardInsertComment]]></act></params></methodCall>',
		beforeSend : function() {
//			initialSetting.insertComment = true;
//			setTimeout(function() {
//				initialSetting.insertComment = false;
//			}, 4000);
		},
		success : function(ret_xml) {
			var parseXML = jQuery.parseXML(ret_xml);
			var xml = jQuery(parseXML);

			var error = xml.find('error').text();
			var message = xml.find('message').text();
			var mid = xml.find('mid').text();
			var document_srl = xml.find('document_srl').text();
			var comment_srl = xml.find('comment_srl').text();
			//var comment_page = xml.find('comment_page').text();
			if(!parseInt(error)){
				/******** 스티커 등록 성공 후 실행할 부분********/
				//loadCommentPage(document_srl, comment_page, comment_srl);
			} else {
				alert(message);
			}
		},
		error : function(request, status, error) {
		},
		complete : function() {
			//initialSetting.insertComment = false;
		}
	});


}

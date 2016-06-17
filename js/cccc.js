function registerCart() {
	var cartInfo=getCart();

	var cartDetail = [];
	for(var key in cartInfo.map) {
		var goodsInfo = cartInfo.map[key];
		cartDetail.push({
			"goods_id"	:key.toString() ,
			"selected"	:"1",
			"goods_num"	:goodsInfo.goodsNum.toString() ,
		});
	}
	$.ajax({
		type: 'POST',
		url: "/cart/list",
		data: {"goods_list":JSON.stringify(cartDetail)},
		success: function(data){
			if (0 != data.code) {
				alert(data.msg);
			} else {
				renderCart(data.data)
			}
		},
		dataType: "json"
	});
}
function renderCart(data) {
	var cartNow = {};
	cartNow['list']=[];
	cartNow['map']={};

	var cost = 0;
	var num = 0;
	var goodsList = data.goodsList;
	for (var key in goodsList) {
		// 加入 globalContext
		var goodsId = goodsList[key].goodsInfo.Id;
		globalContext[goodsId] = goodsList[key].goodsInfo;

		// 记入购物车
		cartNow['map'][goodsId] = {
			'goodsNum' : goodsList[key].goodsNum,
			'selected' : goodsList[key].selected,
		};
		cartNow['list'].push(goodsId);
		cost += goodsList[key].goodsNum * goodsList[key].goodsInfo.Price;
		num += parseInt(goodsList[key].goodsNum);
	}
	cartNow['cost'] = cost;
	cartNow['sub']  = 0;
	cartNow['num']  = num;

	// 更新购物车
	globalCart = cartNow;
	flushCart();

	// 购物车
	cartNow['tips']=data.tips;

	doT.templateSettings = {
		evaluate:	/\{\%([\s\S]+?)\%\}/g,
		interpolate:/\{\%=([\s\S]+?)\%\}/g,
		encode:		/\{\%!([\s\S]+?)\%\}/g,
		use:		/\{\%#([\s\S]+?)\%\}/g,
		define:		/\{\%##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\%\}/g,
		conditional:/\{\%\?(\?)?\s*([\s\S]*?)\s*\%\}/g,
		iterate:	/\{\%~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\%\})/g,
		varname: 'it',
		strip: true,
		append: true,
		selfcontained: false
	};
	var interText = doT.template($("#goods-list-tmpl").text());
	$("#goods-list").html(interText(cartNow)); 

	// 绑定监听 
	$(".item-cart").click(editCart);
}



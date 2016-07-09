// 向服务器验证订单
function registerOrder() {
	var cartInfo=getCartOri();

	var cartDetail = [];
	if (undefined == cartInfo || undefined == cartInfo.map) {
		return;
	}
	for(var key in cartInfo.map) {
		var goodsInfo = cartInfo.map[key];
		cartDetail.push({
			"goods_id"	:key.toString(),
			"selected"	:(undefined == goodsInfo.selected) ? "1" : goodsInfo.selected.toString(),
			"goods_num"	:goodsInfo.goodsNum.toString(),
		});
	}
	$.ajax({
		type: 'POST',
		url: "/order/prepare",
		data: {"goods_list":JSON.stringify(cartDetail)},
		success: function(data){
			if (0 != data.code) {
				alert(data.msg);
			} else {
				if (0 < data.data.alert.length) {
					$("#alertModel .alertText").html(data.data.alert);
					$("#alertModel").modal("show");
					setTimeout(function(){$("#alertModel").modal("hide")}, 2000);
				}
				orderFillContext(data.data);
				orderVerifyCart(data.data);
				renderPrepareOrder(data.data);
			}
		},
		dataType: "json"
	});
}

// -------- data ------------
// 更新购物车数据
function orderFillContext(data) {
	var goodsList = data.orderInfo.goodsList;
	if (0 < goodsList.length) {
		for (var key in goodsList) {
			// 加入 globalOrderContext
			var goodsId = goodsList[key].GoodsId;
			globalOrderContext[goodsId] = goodsList[key];
		}
	}
}
// 将订单中无效的商品过滤出购物车
function orderVerifyCart(data) {
	globalCart =getCartOri();

	var orderGoodsMap = {};
	var goodsList = data.orderInfo.goodsList;
	if (0 < goodsList.length) {
		for (var key in goodsList) {
			orderGoodsMap[goodsList[key].GoodsId] = 1;
		}

		for (var key in globalCart.map) {
			if ( 1 == globalCart.map[key].selected) {
				if (1 != orderGoodsMap[key]) {
					delete(globalCart.map[key])
				}
			}
		}

		var cartGoodsList = [];
		for (var idx in globalCart.list) {
			if ( undefined != globalCart.map[globalCart.list[idx]]) {
				cartGoodsList.push(globalCart.list[idx])
			}
		}
		globalCart.list = cartGoodsList;
	}

	globalCart['cost'] = data.orderInfo.order.OrderAmount;
	globalCart['sub']  = 0;
	globalCart['num']  = globalCart.list.length;
	flushCart();
}

// --------- view -------------------
function renderPrepareOrder(orderData) {
	// 更新购物车
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
	var interText = doT.template($("#order-list-tmpl").text());
	$("#order-list").html(interText(orderData)); 
}
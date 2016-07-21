// 向服务器验证订单
function registerPrepareOrder() {
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
					alertText(data.data.alert)
				}
				orderFillContext(data.data);
				orderVerifyCart(data.data);
				renderPrepareOrder(data.data);
			}
		},
		dataType: "json"
	});
}
// 向服务器提交订单 
function payOrder() {
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
		url: "/order/do_order",
		data: {"goods_list":JSON.stringify(cartDetail)},
		success: function(data){
			if (0 != data.code) {
				alert(data.msg);
			} else {
				if (0 < data.data.alert.length) {
					alertText(data.data.alert)
				}
				// 清空购物车
				orderClearCart(data.data);
				// 调起微信支付
				// weixinPay();
				alertText(data.data.orderInfo.order.OrderAmount)

			}
		},
		dataType: "json"
	});
}

// 向服务器提交订单 
function registerDoOrder() {
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
		url: "/order/do_order",
		data: {"goods_list":JSON.stringify(cartDetail)},
		success: function(data){
			if (0 != data.code) {
				alert(data.msg);
			} else {
				if (0 < data.data.alert.length) {
					alertText(data.data.alert)
				}
				
				orderFillContext(data.data);
				orderVerifyCart(data.data);
				renderOrderList(data.data);
				
			}
		},
		dataType: "json"
	});
}
// 获取订单列表  
function getOrderList(base, bolAsync=true) {
	$.ajax({
		type: 'GET',
		url: "/order/list",
		url: "/test?file=text",
		data: {"base":base,"rn":20},
		async:bolAsync,  
		success: function(data){
			if (0 != data.code) {
				alert(data.msg);
			} else {
				renderOrderList(data.data);
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
// 将买完的商品在购物车中删除
function orderClearCart(data) {
	globalCart =getCartOri();

	var orderGoodsMap = {};
	var goodsList = data.orderInfo.goodsList;
	if (0 < goodsList.length) {
		for (var key in globalCart.map) {
			if ( 1 == globalCart.map[key].selected) {
				// 已购买的删除
				delete(globalCart.map[key])
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

	globalCart['cost'] = 0;
	globalCart['sub']  = 0;
	globalCart['num']  = globalCart.list.length;
	flushCart();
}


// --------- view -------------------
function renderPrepareOrder(orderData) {
	// 更新购物车
	initDot();
	var interText = doT.template($("#order-list-tmpl").text());
	$("#order-list").html(interText(orderData)); 
	$(".payOrder").click(payOrder);
}
function renderOrderInfo(orderData) {
	initDot();
	var interText = doT.template($("#order-list-tmpl").text());
	$("#order-list").html(interText(orderData)); 
}
function renderOrderList(orderData) {
	initDot();
	var interText = doT.template($("#order-list-tmpl").text());
	if (!orderData.hasMore) {
		$("#hasMore").css("display", "none");
	}
	$("#order-list").html($("#order-list").html() + interText(orderData)); 
}
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
				goShopList();
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
				goShopList();
			} else {
				if (0 < data.data.alert.length) {
					alertText(data.data.alert)
				}
				// 清空购物车
				orderClearCart(data.data);
				// 调起微信支付
				// weixinPay();
				alertText(data.data.orderInfo.order.OrderAmount)

				location.href="/order/detail?order_sn=" + data.data.orderInfo.order.OrderSn;
			}
		},
		dataType: "json"
	});
}

// 向服务器提交订单 
function cancelOrder(orderSn, cancelFlag) {
	$.ajax({
		type: 'POST',
		url: "/order/cancel_rder",
		data: {"order_sn":orderSn,"cancel_flag":cancelFlag},
		success: function(data){
			if (0 != data.code) {
				alert(data.msg);
			}
			location.href="/order/detail?order_sn=" + orderSn;
		},
		dataType: "json"
	});
}
// 向服务器提交订单 
function evalOrder(orderSn, stars,feedback) {
	$.ajax({
		type: 'POST',
		url: "/order/eval_order",
		data: {"order_sn":orderSn,"stars":stars,"feedback":feedback},
		success: function(data){
			if (0 != data.code) {
				alert(data.msg);
			}
			goShopList();
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
				goShopList();
			} else {
				if (0 < data.data.alert.length) {
					alertText(data.data.alert)
				}

				orderFillContext(data.data);
				orderVerifyCart(data.data);
				renderOrderInfo(data.data);
			}
		},
		dataType: "json"
	});
}
// 获取订单列表  
function getOrderList(base, bolAsync) {
	if (undefined==bolAsync) {
		bolAsync = true;
	}
	$.ajax({
		type: 'GET',
		url: "/order/list",
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
			// var goodsId = goodsList[key].GoodsId;
			// globalOrderContext[goodsId] = goodsList[key];
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
	// 初始化 addressList
	addressList = orderData.addressList;

	var interText = doT.template($("#order-list-tmpl").text());
	$("#order-list").html(interText(orderData)); 
	
	var interTextAddress = doT.template($("#order-address-info-tmpl").text());
	var interAddressList = doT.template($("#address-list-tmp").text());
	var interModifyAddress = doT.template($("#address-modify-tmp").text());
	renderAddressInfo(interTextAddress, interAddressList, interModifyAddress, orderData.address);

	$(".payOrder").click(payOrder);
}
function renderAddressInfo(interTextAddress, interAddressList, interModifyAddress, addressData) {
	$("#order-address-info").html(interTextAddress(addressData)); 
	var addressInfoList = function(event){
		if (undefined != event) {
			event.preventDefault();
		}

		$("#address-list").html(interAddressList(addressList));
		$("#address-list-parent-dialog").show();

		$(".list-dialog-hide").click(function(event){
			$("#address-list-parent-dialog").hide();
		});

		$("#address-list .address-info").click(function(event){
			event.preventDefault();

			$("#address-list .check").removeClass("appground");

			var self=this;
			$(self).find(".check").addClass("appground");

			var addressId = $(self).attr("app-id");
			addressList.forEach(function(e){  
				if (e.Id == addressId) {
					e.IsDefault = 1;
					// 重新刷新选中的地址
					renderAddressInfo(interTextAddress, interAddressList, interModifyAddress, e); 
				} else {
					e.IsDefault = 0;
				}
			});
		});

		$("#address-list .modify").click(function(event){
			event.preventDefault();
			event.stopPropagation();

			var self=this;
			var addressId = $(self).parent().attr("app-id");
			var addressData;
			addressList.forEach(function(e){  
				if (e.Id == addressId) {
					addressData = e;
				}
			});

			addressData['Type'] = "修改收货地址";
			addressData['Del'] = true;

			$("#address-modify-dialog").html(interModifyAddress(addressData)); 
			init(event);
		});

		$("#address-list .new-address").click(function(event){
			event.preventDefault();
			event.stopPropagation();

			addressData = {
				"Address":"",
				"Gender":0,
				"Id":0,
				"IsDefault":0,
				"LiveArea":"",
				"MemberId":10,
				"Mobile":"",
				"TrueName":"",
				"Type":"新增收货地址",
				"Del":false
			};
			$("#address-modify-dialog").html(interModifyAddress(addressData)); 
			init(event);
		});
	}
	var init = function(event){
		$("#address-modify-parent-dialog").show();
		$("#address-modify-parent-dialog .dialog-hide").click(function(){
			$("#address-modify-parent-dialog").hide();
		});
		$("#address-modify-parent-dialog .mask-main").click(function(event){
			event.preventDefault();
			event.stopPropagation();
		});

		// 删除地址
		$(".del-address").click(function(event){
			var self = this;
			var container = self.parentNode.parentNode;
			var addressId = $(container).find("[data-type='addressId']").attr("data-value");
			var uid = $(container).find("[data-type='uid']").attr("data-value");

			// 提交修改
			$.ajax({
				type: 'POST',
				url: "/address/delete",
				data: {addressId:addressId,uid:uid},
				success: function(data){
					if (0 != data.code) {
						alert(data.msg);
					} else {
						var listRet = [];
						$(addressList).each(function(i,v) {
							if (v.Id != addressId) {
								listRet.push(v);
							}
						});
						addressList = listRet;
					}
					$("#address-modify-parent-dialog").hide();
					addressInfoList();
				},
				dataType: "json"
			});
		});

		// 提交修改
		$(".save-address").click(function(event){
			var data = {};
			$("#address-modify-dialog").find("input").each(function(i,v){
				data[$(v).attr("name")] = v.value;
			});

			var self = this;
			var container = self.parentNode.parentNode;
			var addressId = $(container).find("[data-type='addressId']").attr("data-value");
			data['addressId'] = addressId;
			var uid = $(container).find("[data-type='uid']").attr("data-value");
			data['uid'] = uid;

			// 提交修改
			$.ajax({
				type: 'POST',
				url: "/address/modify",
				data: data,
				success: function(data){
					if (0 != data.code) {
						alert(data.msg);
					} else {
						var finish = false;
						$(addressList).each(function(i,v) {
							if (v.Id == data.data.Id) {
								if (v.IsDefault) {
									data.data.IsDefault = 1;
								}
								addressList[i] = data.data;
								finish = true;
							}
						});
						if (!finish) {
							addressList.push(data.data);
						} 
					}
					$("#address-modify-parent-dialog").hide();
					addressInfoList();
				},
				dataType: "json"
			});
		});
	}
	$(".change-address").click(addressInfoList);


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
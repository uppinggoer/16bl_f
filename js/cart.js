// 向服务器验证购物车
function registerCart() {
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
		url: "/cart/list",
		data: {"goods_list":JSON.stringify(cartDetail)},
		success: function(data){
			if (0 != data.code) {
				alert(data.msg);
			} else {
				if (0 < data.data.alert.length) {
					alertText(data.data.alert);
				}
				fillCart(data.data);
				renderCart(data.data.tips);
			}
		},
		dataType: "json"
	});
}

// -------- data ------------
// 更新购物车数据
function fillCart(data) {
	var cartNow = {};
	cartNow['list']=[];
	cartNow['map']={};

	var goodsList = data.goodsList;
	if (0 < goodsList.length) {
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
		}
	}
	if (0 < cartNow.list.length) {
		cartNow =  verifyCart(cartNow);
	}
	// 更新购物车
	globalCart = cartNow;
	flushCart();
}

// --------- view -------------------
function renderCart(tips) {
	initDot();
	
	// 先刷总信息
	renderCost();

	// 购物车
	cartNow = globalCart;

	// 更新购物车
	cartNow['tips']=tips;
	var interText = doT.template($("#goods-list-tmpl").text());
	$("#goods-list").html(interText(cartNow)); 

	// 绑定监听 
	$(".item-cart").click(editCart);
	$(".cart-goodslist .check").off().click(selectGoods);

	var allSelected = true;
	for (var goodsId in cartNow.map) {
		// 加入 globalContext
		var goodsNum = cartNow.map[goodsId].goodsNum;
		if (1 != cartNow.map[goodsId].selected) {
			allSelected = false;
		}
	}
	if (allSelected) {
		$(".cart-info .check").addClass("appground");
	} else {
		$(".cart-info .check").removeClass("appground");
	}
}

// ---------- controller ---------------
function selectGoods(e) {
	var self = $(this);
	var goodsId = self.attr("goods-id");

	if ("all" == goodsId) {
		var allSelected = true;
		for (var key in globalCart.map) {
			if (1 != globalCart.map[key].selected) {
				allSelected = false;
				break;
			}
		}
		if (allSelected) {
			for (var key in globalCart.map) {
				globalCart.map[key].selected = 0;
			}
		} else {
			for (var key in globalCart.map) {
				globalCart.map[key].selected = 1;
			}
		}
	} else {
		if (0 != globalCart.map[goodsId].selected) {
			globalCart.map[goodsId].selected = 0;
		} else {
			globalCart.map[goodsId].selected = 1;
		}
	}
	globalCart = verifyCart(globalCart);
	flushCart();

	renderCart($("#cart-tip").text());
}
// -------- controller -------------
function cleanCart() {
	globalCart = {};
	flushCart();
	renderCart("");
}
// // 点击事件刷新购物车
// function clickRefreshCart(e) {
// 	// 点击事件
// 	editCart(e);
// 	renderCart($("#cart-tip").text());
// }
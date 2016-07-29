// MVC 化处理

// ----------- controller -----------
function editCart(e) {
	var self = $(this);
	var goodsId = self.attr("goods-id");

	// 在购物车中增加商品
	if (undefined == globalCart['map'][goodsId]) {
		globalCart['map'][goodsId] = {'goodsNum':0};
		globalCart['map'][goodsId] = {'selected':1};
		globalCart['list'].push(goodsId);
	}

	if (undefined == globalCart.map[goodsId].goodsNum) {
		globalCart.map[goodsId].goodsNum = 0;
	}
	globalCart.map[goodsId].selected = 1;
	var oldCountValue = parseInt(globalCart.map[goodsId].goodsNum);
	var countValue = oldCountValue;
	if (0 < self.find(".icon-plus").length) {
		countValue += 1;
	}
	if (0 < self.find(".icon-minus").length) {
		countValue -= 1;
	}
	if (countValue >= globalContext[goodsId].Storage) {
		countValue = globalContext[goodsId].Storage;
		// 显示提示
	}
	globalCart.map[goodsId].goodsNum = countValue;
	// 校验购物车
	globalCart =  verifyCart(globalCart);
	flushCart();

	// 刷新页面
	renderGoodsCnt(goodsId);
	renderCost();

	var dis = countValue - oldCountValue;
	// 无货 或 非加货
	if (0>countValue || 0>=dis) {
	} else {
		// 抛小球
		castToCart(self.offset(), $("li .item-cart").offset());
	}
};

// 跳转到商品分类页
function goShopList(){
	location.replace("/shop/list");
}
// --------- view --------
// 显示商品数量
function renderGoodsCnt(goodsId) {
	var count = $(".count").find("span[goods-id="+goodsId+"]");
	var countAll = $("#cart").find("span");

	var countValue = globalCart.map[goodsId].goodsNum;
	var countAllValue = globalCart.num;
	if (undefined != globalCart.map[goodsId]) {
		count.html(countValue);
		countAll.html(countAllValue);
	}

	// 判断是否显示 右上方商品数量
	var container = $(".cart-count-flag").find("div[goods-id="+goodsId+"]");
	if (undefined != container) {
		if (countValue > 0) {
			container.css("display","block");
		} else {
			container.css("display","none");
		}
	}
	var container = $('#cart').find(".item-cart");
	if (undefined != container) {
		if (countAllValue > 0) {
			container.css("display","block");
		} else {
			container.css("display","none");
		}
	}
};
// 显示订单总价
function renderCost() {
	if (undefined == globalCart['cost']) {
		globalCart['cost'] = 0;
	}
	$(".cart-info #cart-cost").html("￥"+globalCart['cost']);
}
// 地址列表
function getAddress() {
}

// 初始化购物车
function initCart() {
	renderCost();
	globalCart.list.forEach(function(goodsId){
		renderGoodsCnt(goodsId);
	});
};
// 抛小球
function castToCart(lblFrom,lblTo) {
	// (x-x1)(x-x1)(x-x0)/(x1-x0)
	var x0 = lblFrom.left;
	var y0 = lblFrom.top;
	var x1 = lblTo.left;
	var y1 = lblTo.top;
	var disX = x0-x1;
	var disY = y0-y1;
	var step = parseInt(disX/10);
	var i = x0;

	$("#cart-ball").css("display","block");
	var drawTime = setInterval(function(){
		i -= step;
		if (((0 > disX) && (i >=x1)) || ((0 < disX) && (i <=x1))) {
			i = x1;
			clearInterval(drawTime);
			$("#cart-ball").css("display","none");
		}

		var a = (i-x0)/(x1-x0);
		var y = y0 + a*a*(y1-y0);  // 最简单最有效 ！！！！！！
		printFunc(i,y); 
	}, 50);

	var printFunc = function(x,y) {
		// 打印第n个点 一共10个点
		$("#cart-ball").css("left",x+"px");
		$("#cart-ball").css("top",y+"px");
	}
};


//------------- model ---------
// 更新购物车storage
function flushCart() {
	window.localStorage.setItem("cart", JSON.stringify(globalCart));
};
// 获取购物车storage
function getCartOri() {
	var cartInfo = window.localStorage.getItem("cart");
	var cartDetail = {};
	if (null != cartInfo && 0 < cartInfo.length) {
		var cartDetail = JSON.parse(cartInfo);
	}
	return cartDetail;
};
// 获取购物车storage
function getCart() {
	cartDetail = getCartOri();
	cartDetail =  verifyCart(cartDetail);

	window.localStorage.setItem("cart", JSON.stringify(cartDetail));
	return cartDetail;
};
// 强校验购物车
function verifyCart(cartDetail) {
	var list= [];
	var map = {};
	var cost= 0;
	var num = 0;

	if (undefined != cartDetail.list && 0 < cartDetail.list.length) {
		// 强校验并修正， globalContext无此商品直接过滤掉
		cartDetail.list.forEach(function(goodsId){
			if ("undefined" == typeof globalContext || undefined == globalContext[goodsId]) {
				return;
			}
			goodsNum = cartDetail.map[goodsId].goodsNum;
			if (0 > goodsNum) {
				goodsNum = 0;
			}
			if (1 == cartDetail.map[goodsId].selected) {
				cost += goodsNum * globalContext[goodsId].Price;
			}
			list.push(goodsId);
			map[goodsId] = {
				'goodsNum' : goodsNum,
				'selected' : cartDetail.map[goodsId].selected,
			};
			num += parseInt(goodsNum);
		});
	}


	// 强校验并修正
	cartDetail['list'] = list;
	cartDetail['map']  = map;
	cartDetail['cost'] = cost;
	cartDetail['sub']  = 0;
	cartDetail['num']  = num;

	return cartDetail;
}

function initDot() {
		// 更新购物车
	doT.templateSettings = {
		evaluate:	/\{\%([\s\S]+?)\%\}/g,
		interpolate:/\{\%=([\s\S]+?)\%\}/g,
		encode:		/\{\%!([\s\S]+?)\%\}/g,
		use:		/\{\%#([\s\S]+?)\%\}/g,
		define:		/\{\%##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\%\}/g,
		conditional:/\{\%\?(\?)?\s*([\s\S]*?)\s*\%\}/g,
		iterate:	/\{\%~\s*(?:\%\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\%\})/g,
		varname: 'it',
		strip: true,
		append: true,
		selfcontained: false
	};
}

// 警告框
function alertText(text, timeout=2000) {
	if (0 >= $("#alertModel").length) {
		alertDiv = '\
			<div class="modal fade" id="alertModel" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">\
				<div class="modal-dialog" role="document" style="top: 30%;position: absolute;width: 80;left: 10%;width: 80%;">\
					<div class="modal-content"> \
						<div class="modal-body" style="text-align: center;"> \
							<span class="alertText" style="color:red;"></span> \
						</div> \
					</div> \
				</div> \
			</div> \
		';
		$("body").append(alertDiv);
	}
	$("#alertModel .alertText").html(text);
	$("#alertModel").modal("show");
	if (timeout > 0) {
		setTimeout(function(){$("#alertModel").modal("hide")}, timeout);
	}
}


// ------------- view -----------
function renderAddress(orderData) {
	initDot();
	var interText = doT.template($("#address-modify-tmp").text());
	$("#address-modify-dialog").html(interText(orderData)); 
}

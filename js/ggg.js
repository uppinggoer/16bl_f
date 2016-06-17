function editCart(e) {
	var self = $(this);
	var goodsId = self.attr("goods-id");

	// 在购物车中增加商品
	if (undefined == globalCart['map'][goodsId]) {
		globalCart['map'][goodsId] = {'goodsNum':0};
		globalCart['list'].push(goodsId);
	}

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
	if (0 > countValue) {
		countValue = 0;
	}

	var dis = countValue - oldCountValue;
	var countAllValue = parseInt(globalCart.num) + dis;

	// 刷新购物车
	globalCart['map'][goodsId]['goodsNum'] = countValue;
	globalCart.num = countAllValue;
	// 刷新页面
	modifyGoodsCnt(goodsId, countValue, countAllValue);
	// 保存购物车
	flushCart();

	// 无货 或 非加货
	if (0>countValue || 0>=dis) {
	} else {
		castToCart(self.offset(), $("li .item-cart").offset());
	}
};
function modifyGoodsCnt(goodsId,countValue,countAllValue) {
	var count = $(".count").find("span[goods-id="+goodsId+"]");
	var countAll = $("#cart").find("span");
	count.html(countValue);
	countAll.html(countAllValue);

	// 判断是否显示 右上方商品数量
	var container = $(".cart-count-flag").find("div[goods-id="+goodsId+"]");
	if (undefined != container) {
		if (countValue > 0) {
			container.css("display","block");
		} else {
			container.css("display","none");
			globalCart['map'][goodsId]['goodsNum'] = 0;
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

	var drawTime = setInterval(function(){
		i -= step;
		if (((0 > disX) && (i >=x1)) || ((0 < disX) && (i <=x1))) {
			i = x1;
			clearInterval(drawTime);
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

// 更新购物车storage
function flushCart() {
	window.localStorage.setItem("cart", JSON.stringify(globalCart));
};
// 获取购物车storage
function getCart() {
	var cartInfo = window.localStorage.getItem("cart");
	if (0 < cartInfo.length) {
		var cartDetail = JSON.parse(cartInfo);
	} else {
		var cartDetail = {"list":[],"map":{},"cost":0,"sub":0,"num":0};
	}

	// 初始化页面
	cartDetail.list.forEach(function(e){
		modifyGoodsCnt(e, cartDetail.map[e].goodsNum,cartDetail.num);
	});

	return cartDetail;
};
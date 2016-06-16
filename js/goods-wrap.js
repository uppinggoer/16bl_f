$(".item-cart").click(function(e) {
	var self = $(this);
	var goodsId = self.attr("goods-id");

	// 在购物车中增加商品
	if (undefined == globalCart['map'][goodsId]) {
		globalCart['map'][goodsId] = {'goodsNum':0};
		globalCart['list'].push(goodsId);
	}

	var countValue = globalCart.map[goodsId].goodsNum;
	var countAllValue = globalCart.num;
	if (0 < self.find(".icon-plus").length) {
		if (countValue < globalContext[goodsId].Storage) {
			countValue += 1;
			countAllValue += 1;
		}
	}
	if (0 < self.find(".icon-minus").length) {
		if (0<countValue && 0<countAllValue) {
			countValue -= 1;
			countAllValue -= 1;
		}
	}

	if ((0>countValue) && (0>countAllValue)) {
		return;
	}

	// 刷新购物车
	globalCart['map'][goodsId]['goodsNum'] = countValue;
	globalCart.num = countAllValue;

	// 刷新页面
	modifyGoodsCnt(goodsId, countValue, countAllValue);

	// 如果增加商品则滚动小球
	if (0 < self.find(".icon-plus").length) {
		castToCart(self.offset(), $("li .item-cart").offset());
	}

	// 保存购物车
	flushCart();
});
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
			globalCart['map'][goodsId]['goodsNum'] -= 1;
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

function getCartInfo() {
	var goodsList = [];
	for (i in globalCart.list) {
		goodsList.push(i);
	}
	var goodsIdList = goodsList.join(",");
	var url = "http://www.baidu.com/cart/list?goods_ids=" + goodsIdList + "&request_id=" + "XXX";
	location.href = url;
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

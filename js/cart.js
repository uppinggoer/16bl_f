function fillcart() {
  var source   = $("#entry-template").html();
  var template = Handlebars.compile(source);
  var html    = template(globalCart);
  $("#goodslist").html(html)
}
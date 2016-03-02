(function(){
Template.__checkName("messageItem");
Template["messageItem"] = new Template("Template.messageItem", (function() {
  var view = this;
  return HTML.DIV({
    "class": "list-item"
  }, "\n    ", Blaze.View("lookup:text", function() {
    return Spacebars.mustache(view.lookup("text"));
  }), "\n  ");
}));

}).call(this);

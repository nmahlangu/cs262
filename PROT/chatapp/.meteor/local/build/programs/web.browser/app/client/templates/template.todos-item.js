(function(){
Template.__checkName("todosItem");
Template["todosItem"] = new Template("Template.todosItem", (function() {
  var view = this;
  return [ HTML.Raw('<!-- <div class="list-item {{checkedClass}} {{editingClass}}">\n    <label class="checkbox">\n      <input type="checkbox" checked="{{checked}}" name="checked">\n      <span class="checkbox-custom"></span>\n    </label>\n\n    <input type="text" value="{{text}}" placeholder="Task name">\n    <a class="js-delete-item delete-item" href="#"><span class="icon-trash"></span></a>\n  </div> -->\n  '), HTML.DIV({
    "class": "list-item"
  }, "\n    ", Blaze.View("lookup:text", function() {
    return Spacebars.mustache(view.lookup("text"));
  }), "\n  ") ];
}));

}).call(this);

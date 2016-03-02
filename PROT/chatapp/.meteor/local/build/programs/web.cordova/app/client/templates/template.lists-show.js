(function(){
Template.__checkName("listsShow");
Template["listsShow"] = new Template("Template.listsShow", (function() {
  var view = this;
  return HTML.DIV({
    "class": "page lists-show"
  }, "\n    ", HTML.NAV({
    "class": "js-title-nav"
  }, "\n        ", HTML.Raw('<div class="nav-group">\n          <a href="#" class="js-menu nav-item"><span class="icon-list-unordered" title="Show menu"></span></a>\n        </div>'), "\n\n        ", HTML.H1({
    "class": "js-edit-list title-page"
  }, HTML.SPAN({
    "class": "title-wrapper"
  }, Blaze.View("lookup:name", function() {
    return Spacebars.mustache(view.lookup("name"));
  })), " ", HTML.SPAN({
    "class": "count-list"
  }, Blaze.View("lookup:messageCount", function() {
    return Spacebars.mustache(view.lookup("messageCount"));
  }))), "\n\n      ", HTML.Raw('<form class="js-todo-new todo-new input-symbol">\n        <input type="text" placeholder="Type to send message">\n        <span class="icon-add js-todo-add"></span>\n      </form>'), "\n    "), "\n\n\n    ", HTML.DIV({
    "class": "content-scrollable list-items"
  }, "\n      ", Blaze.If(function() {
    return Spacebars.call(view.lookup("todosReady"));
  }, function() {
    return [ "\n        ", Spacebars.With(function() {
      return Spacebars.call(view.lookup("_id"));
    }, function() {
      return [ " \n          ", Blaze.Each(function() {
        return Spacebars.dataMustache(view.lookup("todos"), view.lookup("."));
      }, function() {
        return [ "\n            ", Spacebars.include(view.lookupTemplate("todosItem")), "\n          " ];
      }, function() {
        return [ "\n            ", HTML.DIV({
          "class": "wrapper-message"
        }, "\n              ", HTML.DIV({
          "class": "title-message"
        }, "No messages here"), "\n              ", HTML.DIV({
          "class": "subtitle-message"
        }, "Add new tasks using the field above"), "\n            "), "\n          " ];
      }), "\n        " ];
    }), "\n      " ];
  }, function() {
    return [ "\n          ", HTML.DIV({
      "class": "wrapper-message"
    }, "\n            ", HTML.DIV({
      "class": "title-message"
    }, "Loading tasks..."), "\n          "), "\n      " ];
  }), "\n    "), "\n  ");
}));

}).call(this);

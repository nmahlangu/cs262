(function(){
Template.__checkName("listsShow");
Template["listsShow"] = new Template("Template.listsShow", (function() {
  var view = this;
  return HTML.DIV({
    "class": "page lists-show"
  }, "\n    ", HTML.NAV({
    "class": "js-title-nav"
  }, "\n      ", HTML.Raw('<!-- {{#if editing}}\n        <form class="js-edit-form list-edit-form">\n          <input type="text" name="name" value="{{name}}">\n          <div class="nav-group right">\n            <a href="#" class="js-cancel nav-item"><span class="icon-close js-cancel" title="Cancel"></span></a>\n          </div>\n        </form>\n      {{else}} -->'), "\n        ", HTML.Raw('<div class="nav-group">\n          <a href="#" class="js-menu nav-item"><span class="icon-list-unordered" title="Show menu"></span></a>\n        </div>'), "\n\n        ", HTML.H1({
    "class": "js-edit-list title-page"
  }, HTML.SPAN({
    "class": "title-wrapper"
  }, Blaze.View("lookup:name", function() {
    return Spacebars.mustache(view.lookup("name"));
  })), " ", HTML.SPAN({
    "class": "count-list"
  }, Blaze.View("lookup:incompleteCount", function() {
    return Spacebars.mustache(view.lookup("incompleteCount"));
  }))), "\n\n        ", HTML.Raw('<!-- <div class="nav-group right">\n          <div class="nav-item options-mobile">\n            <select class="list-edit">\n              <option disabled selected>Select an action</option>\n              {{#if userId}}\n                <option value="public">Make Public</option>\n              {{else}}\n                <option value="private">Make Private</option>\n              {{/if}}\n              <option value="delete">Delete</option>\n            </select>\n            <span class="icon-cog"></span>\n          </div>\n          <div class="options-web">\n            <a class="js-toggle-list-privacy nav-item">\n              {{#if userId}}\n                <span class="icon-lock" title="Make list public"></span>\n              {{else}}\n                <span class="icon-unlock" title="Make list private"></span>\n              {{/if}}\n            </a>\n\n            <a class="js-delete-list nav-item">\n              <span class="icon-trash" title="Delete list"></span>\n            </a>\n          </div>\n        </div> -->'), "\n      ", HTML.Raw("<!-- {{/if}} -->"), "\n\n      ", HTML.Raw('<form class="js-todo-new todo-new input-symbol">\n        <input type="text" placeholder="Type to send message">\n        <span class="icon-add js-todo-add"></span>\n      </form>'), "\n    "), "\n\n\n    ", HTML.DIV({
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
        }, "No tasks here"), "\n              ", HTML.DIV({
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

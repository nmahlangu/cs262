(function(){
Template.__checkName("listNew");
Template["listNew"] = new Template("Template.listNew", (function() {
  var view = this;
  return HTML.DIV({
    "class": "page auth"
  }, HTML.Raw('\n    <nav>\n      <div class="nav-group">\n        <a href="#" class="js-menu nav-item"><span class="icon-list-unordered"></span></a>\n      </div>\n    </nav>\n\n    '), HTML.DIV({
    "class": "content-scrollable"
  }, "\n      ", HTML.DIV({
    "class": "wrapper-auth"
  }, "\n        ", HTML.Raw('<h1 class="title-auth">Create New Group.</h1>'), "\n        ", HTML.Raw('<p class="subtitle-auth">Create new chat group by entering user accounts.</p>'), "\n\n        ", HTML.Raw('<form class="new-list">\n          <div class="input-symbol">\n            <input type="text" name="emails" placeholder="User Accounts">\n            <span class="icon-user-add" title="User Accounts"></span>\n          </div>\n          <button type="submit" name="listCreate" class="btn-primary">Create</button>\n        </form>'), "\n        ", HTML.Raw("<br>"), "\n        ", HTML.Raw('<form class="search">\n          <div class="input-symbol ">\n            <input type="text" name="search-entry" placeholder="Search for users">\n            <span class="icon-user-add" title="User Accounts"></span>\n          </div>\n          <button type="submit" name="search" class="btn-primary">Search</button>\n        </form>'), "\n        ", HTML.DIV("\n          Search results\n          ", Blaze.View("lookup:searchResults", function() {
    return Spacebars.mustache(view.lookup("searchResults"));
  }), "\n        "), "\n      "), "\n    "), "\n  ");
}));

}).call(this);

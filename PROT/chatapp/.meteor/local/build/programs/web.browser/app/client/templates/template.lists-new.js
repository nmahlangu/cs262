(function(){
Template.__checkName("listNew");
Template["listNew"] = new Template("Template.listNew", (function() {
  var view = this;
  return HTML.Raw('<div class="page auth">\n    <nav>\n      <div class="nav-group">\n        <a href="#" class="js-menu nav-item"><span class="icon-list-unordered"></span></a>\n      </div>\n    </nav>\n\n    <div class="content-scrollable">\n      <div class="wrapper-auth">\n        <h1 class="title-auth">Create New Group.</h1>\n        <p class="subtitle-auth">Create new chat group by entering user accounts.</p>\n\n        <form>\n          <div class="input-symbol ">\n            <input type="text" name="emails" placeholder="User Accounts">\n            <span class="icon-user-add" title="User Accounts"></span>\n          </div>\n          <button type="submit" class="btn-primary">Create</button>\n        </form>\n      </div>\n    </div>\n  </div>');
}));

}).call(this);

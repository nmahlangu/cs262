(function(){
Template.__checkName("listNew");
Template["listNew"] = new Template("Template.listNew", (function() {
  var view = this;
  return HTML.Raw('<div class="page auth">\n    <nav>\n      <div class="nav-group">\n        <a href="#" class="js-menu nav-item"><span class="icon-list-unordered"></span></a>\n      </div>\n    </nav>\n\n    <div class="content-scrollable">\n      <div class="wrapper-auth">\n        <h1 class="title-auth">Create New Group.</h1>\n        <p class="subtitle-auth">Create new chat group by entering user accounts.</p>\n\n        <form>\n          <!-- {{#if errorMessages}}\n            <div class="list-errors">\n              {{#each errorMessages}}\n                <div class="list-item">{{this}}</div>\n              {{/each}}\n            </div>\n          {{/if}} -->\n\n          <!-- <div class="input-symbol {{errorClass \'email\'}}"> -->\n          <div class="input-symbol ">\n            <input type="email" name="email" placeholder="User Accounts">\n            <span class="icon-user-add" title="User Accounts"></span>\n          </div>\n\n          <!-- <div class="input-symbol {{errorClass \'password\'}}">\n            <input type="password" name="password" placeholder="Password" />\n            <span class="icon-lock" title="Password"></span>\n          </div> -->\n\n          <button type="submit" class="btn-primary">Create</button>\n        </form>\n      </div>\n    </div>\n  </div>');
}));

}).call(this);

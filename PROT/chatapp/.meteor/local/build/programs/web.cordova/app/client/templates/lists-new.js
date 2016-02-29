(function(){var ERRORS_KEY = 'signinErrors';

Template.listNew.onCreated(function() {
  Session.set(ERRORS_KEY, {});
});

Template.listNew.helpers({
  // errorMessages: function() {
  //   return _.values(Session.get(ERRORS_KEY));
  // },
  // errorClass: function(key) {
  //   return Session.get(ERRORS_KEY)[key] && 'error';
  // }
});

Template.listNew.events({
  'submit': function(event, template) {
    event.preventDefault();

    var emails = template.$('[name=emails]').val();
    var accountNames = emails.split(',');

    // Get lists of user ids
    // Meteor.users.find({ "emails.address" : 'foo@foo.com' });

    console.log(accountNames);

    var list = {name: emails, incompleteCount: 0};
    list._id = Lists.insert(list);

    Router.go('listsShow', list);
  }
});

}).call(this);

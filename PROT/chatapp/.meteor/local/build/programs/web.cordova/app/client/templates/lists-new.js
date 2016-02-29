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

    // get accountEmails
    var emails = template.$('[name=emails]').val();
    var accountEmails = emails.split(',');

    // get users from DB
    users = [];
    accountEmails.forEach(function(d) {
      users.push(Meteor.users.find().fetch());
    });
    users = users[0];

    // get user IDs from database
    userIds = [];
    users.forEach(function(user) {
      if (accountEmails.indexOf(user.emails[0].address) != -1) {
        userIds.push(user._id);
      }
    });

    // store group in database
    if (userIds.length == accountEmails.length){
      var group = {userIds: userIds, name: emails, incompleteCount: 0};
      group._id = Lists.insert(group);

      // goes to the list you just made
      Router.go('listsShow', group);
    }
  }
});

}).call(this);

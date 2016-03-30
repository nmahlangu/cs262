var ERRORS_KEY = 'signinErrors';

/**
 * Setup function that sets default search results and errors
 */
Template.listNew.onCreated(function() {
  Session.set(ERRORS_KEY, {});
  Session.set("searchResults", "");
});

Template.listNew.helpers({
  /**
   * Helper function to search for users in the database. 
   * Is used in the HTML template.
   * @param query: 
   */
  searchResults: function(query) {
    return Session.get("searchResults");
  }
});

/**
 * Meteor event handlers that are called from the HTML
 */
Template.listNew.events({
  /**
   * Function to create a new list in the database.
   * @param event a jQuery event handler
   * @param template: an html template for the view
   */
  'submit .new-list': function(event, template) {
    event.preventDefault();

    // get accountEmails
    var nameInput = template.$('[name=emails]').val();
    var groupUsers = nameInput.split(',');

    // get user IDs from database
    userIds = [];
    Meteor.users.find().forEach(function(user) {
      if (groupUsers.indexOf(user.username) != -1) {
        userIds.push(user._id);
      }
    });

    // store group in database
    if (userIds.length == groupUsers.length) {
      var group = {userIds: userIds, name: nameInput, messageCount: 0};
      group._id = Lists.insert(group);

      // goes to the list you just made
      Router.go('listsShow', group);
    } 
    else {
      alert("Please doublecheck usernames");
    }
  },

  /**
   * Function to search for other users in the database.
   * @param event: a jQuery event handler
   * @param template: an html template for the view
   */
  "submit .search": function(event, template) {
    event.preventDefault();

    var query = template.$('[name=search-entry]').val();
    var result = Meteor.users.find({username: {$regex: query}});
    var resultStr = result.map(function(user){ return user.username}).join(',');

    Session.set("searchResults", resultStr);
  }
});
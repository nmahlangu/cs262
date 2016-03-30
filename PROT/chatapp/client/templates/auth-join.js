var ERRORS_KEY = 'joinErrors';

/**
 * Set up default session parameters
 */
Template.join.onCreated(function() {
  Session.set(ERRORS_KEY, {});
});

/**
 * Meteor helper functions used to display errors to the user
 */
Template.join.helpers({
  errorMessages: function() {
    return _.values(Session.get(ERRORS_KEY));
  },
  errorClass: function(key) {
    return Session.get(ERRORS_KEY)[key] && 'error';
  }
});

Template.join.events({
  /**
   * Function that lets the user join the system
   * @param event: a jQuery event handler
   * @param template: an html template for the view
   */
  'submit': function(event, template) {
    event.preventDefault();
    var email = template.$('[name=email]').val();
    var password = template.$('[name=password]').val();
    var confirm = template.$('[name=confirm]').val();

    var errors = {};

    if (! email) {
      errors.email = 'Name required';
    }

    if (! password) {
      errors.password = 'Password required';
    }

    if (confirm !== password) {
      errors.confirm = 'Please confirm your password';
    }

    Session.set(ERRORS_KEY, errors);
    if (_.keys(errors).length) {
      return;
    }

    Accounts.createUser({
      username: email,
      password: password
    }, function(error) {
      if (error) {
        return Session.set(ERRORS_KEY, {'none': error.reason});
      }

      Router.go('home');
    });
  }
});

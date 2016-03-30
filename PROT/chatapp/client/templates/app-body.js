/**
 * Set up default session parameters
 */
var MENU_KEY = 'menuOpen';
Session.setDefault(MENU_KEY, false);
var USER_MENU_KEY = 'userMenuOpen';
Session.setDefault(USER_MENU_KEY, false);
var SHOW_CONNECTION_ISSUE_KEY = 'showConnectionIssue';
Session.setDefault(SHOW_CONNECTION_ISSUE_KEY, false);
var CONNECTION_ISSUE_TIMEOUT = 5000;

/**
 * Set up function that is called when meteor starts for the first time
 */
Meteor.startup(function () {
  /**
   * Set up swipe left / right handler for mobile devices
   */
  $(document.body).touchwipe({
    wipeLeft: function () {
      Session.set(MENU_KEY, false);
    },
    wipeRight: function () {
      Session.set(MENU_KEY, true);
    },
    preventDefaultEvents: false
  });

  /**
   * Only show the connection error box if it has been 5 seconds since
   * the app started
   */
  setTimeout(function () {
    dataReadyHold.release();                      
    Session.set(SHOW_CONNECTION_ISSUE_KEY, true); 
  }, CONNECTION_ISSUE_TIMEOUT);
});

/**
 * Meteor functions to modify HTML
 */
Template.appBody.onRendered(function() {
  this.find('#content-container')._uihooks = {
    /**
     * Insert an element into the HTML
     * @param node: HTML node
     * @param next: HTML node
     */
    insertElement: function(node, next) {
      $(node)
        .hide()
        .insertBefore(next)
        .fadeIn(function () {
          if (listFadeInHold) {
            listFadeInHold.release();
          }
        });
    },
    /**
     * Remove an element from the HTML
     * @param node: HTML node
     */
    removeElement: function(node) {
      $(node).fadeOut(function() {
        $(this).remove();
      });
    }
  };
});

/**
 * Meteor helper functions to modify HTML
 */
Template.appBody.helpers({
  /**
   * We use #each on an array of one item so that the "list" template is
   * removed and a new copy is added when changing lists, which is
   * important for animation purposes. #each looks at the _id property of it's
   * items to know when to insert a new item and when to update an old one.
   */
  thisArray: function() {
    return [this];
  },
  /**
   * Helper function to return the session's menu key
   */
  menuOpen: function() {
    return Session.get(MENU_KEY) && 'menu-open';
  },
  /**
   * Helper function to return if the session is cordova
   */
  cordova: function() {
    return Meteor.isCordova && 'cordova';
  },
  /**
   * Helper function that returns the username
   */
  username: function() {
    return Meteor.user().username;
  },
  /**
   * Helper function that returns the session's user menu key
   */
  userMenuOpen: function() {
    return Session.get(USER_MENU_KEY);
  },
  /**
   * Helper function that returns all database list
   */
  lists: function() {
    return Lists.find();
  },
  /**
   * Helper function that returns if list classes are active
   */
  activeListClass: function() {
    var current = Router.current();
    if (current.route.name === 'listsShow' && current.params._id === this._id) {
      return 'active';
    }
  },
  /**
   * Helper function that returns if the database is connectd
   */
  connected: function() {
    if (Session.get(SHOW_CONNECTION_ISSUE_KEY)) {
      return Meteor.status().connected;
    } else {
      return true;
    }
  }
});

/**
 * Meteor event handlers that are called from the HTML
 */
Template.appBody.events({
  /**
   * Function to toggle the current menu
   */
  'click .js-menu': function() {
    Session.set(MENU_KEY, ! Session.get(MENU_KEY));
  },
  /**
   * Function to toggle the content overlay
   * @param event: a jQuery event handler
   */
  'click .content-overlay': function(event) {
    Session.set(MENU_KEY, false);
    event.preventDefault();
  },
  /**
   * Function to toggle the user menu
   * @param event: a jQuery event handler
   */
  'click .js-user-menu': function(event) {
    Session.set(USER_MENU_KEY, ! Session.get(USER_MENU_KEY));
    event.stopImmediatePropagation(); // stop the menu from closing
  },
  /**
   * Function that hides the menu
   */
  'click #menu a': function() {
    Session.set(MENU_KEY, false);
  },
  /**
   * Function that logs the user out
   */
  'click .js-logout': function() {
    Meteor.logout();
    Router.go('signin');
  },
  /**
   * Function that deletes the user's account
   */
  'click .js-delete': function() {
    Meteor.logout();
    Router.go('signin');

    Meteor.users.remove({_id: Meteor.userId()});
  },
});

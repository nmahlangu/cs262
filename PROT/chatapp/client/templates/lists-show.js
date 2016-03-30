var EDITING_KEY = 'editingList';
Session.setDefault(EDITING_KEY, false);

/**
 * Track if this is the first time the list template is rendered
 */
var firstRender = true;
var listRenderHold = LaunchScreen.hold();
listFadeInHold = null;

/**
 * Function that sets up home screen for mobile and desktop devices
 */
Template.listsShow.onRendered(function() {
  if (! Meteor.user()) {
    Router.go('signin');
  }

  if (firstRender) {
    listFadeInHold = LaunchScreen.hold(); // Released in app-body.js
    listRenderHold.release(); // Handle for launch screen defined in app-body.js
    firstRender = false;
  }

  this.find('.js-title-nav')._uihooks = {
    /**
     * Insert an element into the HTML
     * @param node: HTML node
     * @param next: HTML node
     */
    insertElement: function(node, next) {
      $(node)
        .hide()
        .insertBefore(next)
        .fadeIn();
    },
    /**
     * Remove an element from the HTML
     * @param node: HTML node
     */
    removeElement: function(node) {
      $(node).fadeOut(function() {
        this.remove();
      });
    }
  };
});

/**
 * Meteor helper functions to modify HTML
 */
Template.listsShow.helpers({
  /**
   * Helper function that returns the editing key
   */
  editing: function() {
    return Session.get(EDITING_KEY);
  },
  /**
   * Helper function that returns if todos have loaded yet
   */
  todosReady: function() {
    return Router.current().todosHandle.ready();
  },
  /**
   * Helper function that returns all lists
   * @param listID: a string (e.g. fTrS7xxnqvWf88dNJ) that corresponds to a unique db list id
   */
  todos: function(listId) {
    return Messages.find({listId: listId}, {sort: {createdAt : -1}});
  }
});

/**
 * Function that lets the user edit a list
 * @param list: list the user wants to edit
 * @param template: an html template for the view
 */
var editList = function(list, template) {
  console.log("list");
  console.log(list);
  Session.set(EDITING_KEY, true);

  // force the template to redraw based on the reactive change
  Tracker.flush();
  template.$('.js-edit-form input[type=text]').focus();
};

/**
 * Function that lets the user save a list
 * @param list: list the user wants to save
 * @param template: an html template for the view
 */
var saveList = function(list, template) {
  Session.set(EDITING_KEY, false);
  Lists.update(list._id, {$set: {name: template.$('[name=name]').val()}});
}

/**
 * Meteor event handlers that are called from the HTML
 */
Template.listsShow.events({
  /**
   * Function that toggles if the user is editing
   */
  'click .js-cancel': function() {
    Session.set(EDITING_KEY, false);
  },

  /**
   * Function that checks if the user pressed escape
   * @param event: a jQuery event handler
   */
  'keydown input[type=text]': function(event) {
    // ESC
    if (27 === event.which) {
      event.preventDefault();
      $(event.target).blur();
    }
  },

  /**
   * Function that checks if the user pressed escape
   * @param event: a jQuery event handler
   * @param template: an html template for the view
   */
  'blur input[type=text]': function(event, template) {
    // if we are still editing (we haven't just clicked the cancel button)
    if (Session.get(EDITING_KEY))
      saveList(this, template);
  },

 /**
   * Function that submits a template
   * @param event: a jQuery event handler
   * @param template: an html template for the view
   */
  'submit .js-edit-form': function(event, template) {
    event.preventDefault();
    saveList(this, template);
  },

  /**
   * Handle mousedown otherwise the blur handler above will swallow the click.
   * On iOS, we still require the click event so handle both.
   * @param event: a jQuery event handler
   */
  'mousedown .js-cancel, click .js-cancel': function(event) {
    event.preventDefault();
    Session.set(EDITING_KEY, false);
  },

  /**
   * Function that updates the list the user is editing
   * @param event: a jQuery event handler
   * @param template: an html template for the view
   */
  'change .list-edit': function(event, template) {
    if ($(event.target).val() === 'edit') {
      editList(this, template);
    } else if ($(event.target).val() === 'delete') {
      deleteList(this, template);
    } else {
      toggleListPrivacy(this, template);
    }

    event.target.selectedIndex = 0;
  },

  /**
   * Function that updates what list the user is editing
   * @param event: a jQuery event handler
   * @param template: an html template for the view
   */
  'click .js-edit-list': function(event, template) {
    editList(this, template);
  },
  /**
   * Function that updates UI for a new todo
   * @param event: a jQuery event handler
   * @param template: an html template for the view
   */
  'click .js-todo-add': function(event, template) {
    template.$('.js-todo-new input').focus();
  },

  /**
   * Function that submits item into the message table in the database
   * @param event: a jQuery event handler
   */
  'submit .js-todo-new': function(event) {
    event.preventDefault();

    var $input = $(event.target).find('[type=text]');
    if (! $input.val())
      return;

    Messages.insert({
      listId: this._id,
      senderId: this.userId,
      text: $input.val(),
      checked: false,
      createdAt: new Date()
    });
    Lists.update(this._id, {$inc: {messageCount: 1}});
    $input.val('');
  }
});

Meteor.users.allow({
  remove: function() {
    var p = Meteor.npmRequire('protobufjs');
    return true;
  }
});

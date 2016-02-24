// db tables
Messages = new Meteor.Collection("messages");
Groups = new Meteor.Collection("groups");

// types of message recipients
var recepientTypes = {
		ACCOUNT: 0,
		GROUP: 1
};

// REMOVE AFTER TESTING 
// empty accounts and create 3 dummy users
function resetAccounts() {
	// drop table
	Meteor.users.remove({});

	// create new users
	for (var i = 0; i < 4; i++) {
		Accounts.createUser({
			username: "testuser" + (i + 1).toString(),
			password: "testpassword" + (i + 1).toString()
		});
	}
}

// REMOVE AFTER TESTING
// send 3 "group" messages from testuser2 to testuser1
// send 3 "group" messages from testuser2 to testuser1 and testuser3
// send 3 "group" messages from testuser1 to testuser 2, 3, and 4
function sendTestGroupMessages() {
	// drop tables
	Groups.remove({});
	Messages.remove({});

	// test accounts
	var testuser1 = Meteor.users.findOne({username: "testuser1"});
	var testuser2 = Meteor.users.findOne({username: "testuser2"});
	var testuser3 = Meteor.users.findOne({username: "testuser3"});
	var testuser4 = Meteor.users.findOne({username: "testuser4"});

	// get a new group id number
	var newGroupId = Random.id();

	// insert messages
	// send 3 "group" messages from testuser2 to testuser1
	for (var i = 0; i < 3; i++) {
		Messages.insert({
			recipientId: newGroupId,
			recipientType: recepientTypes.GROUP,
			id: Random.id(), 
			senderId: testuser2._id,
			createdAt: new Date(),
			content: "Message " + (i + 1).toString() + " from testuser2 to testuser1"
		});
	}

	// insert new group with corresponding groupId
	Groups.insert({
		groupId: newGroupId,
		accountIds: [testuser1._id, testuser2._id]
	});

	// get a new group id number
	newGroupId = Random.id();

	// insert messages
	// send 3 "group" messages from testuser2 to testuser1 and testuser3
	for (var i = 0; i < 3; i++) {
		Messages.insert({
			recipientId: newGroupId,
			recipientType: recepientTypes.GROUP,
			messageId: Random.id(), 
			senderId: testuser2._id,
			createdAt: new Date(),
			content: "Message " + (i + 1).toString() + " from testuser2 to testuser1 and testuser3"
		});
	}

	// insert new group with corresponding groupId
	Groups.insert({
		groupId: newGroupId,
		accountIds: [testuser1._id, testuser2._id, testuser3._id]
	});

	// get a new group id number
	newGroupId = Random.id();

	// insert messages
	// send 3 "group" messages from testuser1 to testuser 2, 3, and 4
	for (var i = 0; i < 3; i++) {
		Messages.insert({
			recipientId: newGroupId,
			recipientType: recepientTypes.GROUP,
			messageId: Random.id(), 
			senderId: testuser1._id,
			createdAt: new Date(),
			content: "Message " + (i + 1).toString() + " from testuser1 to testuser2, testuser3, testuser4"
		});
	}

	// insert new group with corresponding groupId
	Groups.insert({
		groupId: newGroupId,
		accountIds: [testuser1._id, testuser2._id, testuser3._id, testuser4._id]
	});
}

// returns an array of group objects the user is in
function getGroupsUserIsIn() {
	groupsUserIsIn = Groups.find({}).fetch();
	groupsUserIsIn = groupsUserIsIn.filter(function(d) {
		return d.accountIds.indexOf(Meteor.userId()) != -1;
	})
	return groupsUserIsIn;
}

// creates a group name just like facebook messenger
function createGroupNameFromGroupObj(obj) {
	var groupName = "";
	obj.accountIds.forEach(function(id) {
		if (id != Meteor.userId()) {
			if (groupName == "") {
				groupName = Meteor.users.findOne({_id: id}).username;
			}
			else {
				groupName += ", " + Meteor.users.findOne({_id: id}).username;
			}
		}	
	});
	return groupName;
}

// server
if (Meteor.isServer) {
	// testing init
	// resetAccounts();
	sendTestGroupMessages();
}

// client
if (Meteor.isClient) {
	// set document title
	document.title = "Protocol Buffer Chat";

	// account stuff
	Accounts.ui.config({
    	passwordSignupFields: 'USERNAME_ONLY'
  	});

	// body event handlers
	Template.body.events({
		"click .logCurrentUser": function(event) {
      		event.preventDefault();	// don't submit
			console.log("Here is a log of the current user: ");
			console.log(Meteor.user());
		},
		"click .logUserAccountMessages": function(event) {
			event.preventDefault(); // don't submit
			var userMessages = Messages.find({recipientId: Meteor.userId()}, {sort: {ts: -1}});
			console.log("Here is a log of the current user's 'account' messages: ");
			console.log(userMessages.fetch());
		},
		"click .logUserGroups": function(event) {
			event.preventDefault(); // don't submit
			groupsUserIsIn = Groups.find({}).fetch();
			groupsUserIsIn = groupsUserIsIn.filter(function(d) {
				return d.accountIds.indexOf(Meteor.userId()) != -1;
			});
			console.log("Here is a log of the groups the current user is in: ");
			console.log(groupsUserIsIn);
		}
    });

    // groups
     Template.body.helpers({
    	groups: function() {
			var groupsUserIsIn = getGroupsUserIsIn();
    		var groupNames = [];
    		groupsUserIsIn.forEach(function(group) {
    			groupNames.push(createGroupNameFromGroupObj(group));
    		});
    		returnVal = []
    		groupNames.forEach(function(d) {
    			var obj = {groupName: d};
    			returnVal.push(obj);
    		});
    		return returnVal;
    	}
    });
}

// meteor methods
Meteor.methods({
	
});
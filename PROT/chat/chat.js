// db tables
Messages = new Meteor.Collection("messages");
Groups = new Meteor.Collection("groups");

// types of message recipients
var recepientTypes = {
		ACCOUNT: 0,
		GROUP: 1
};

// REMOVE: empty accounts and create 3 dummy users
function resetAccounts() {
	// drop table
	Meteor.users.remove({});

	// create new users
	for (var i = 0; i < 3; i++) {
		Accounts.createUser({
			username: "testuser" + (i + 1).toString(),
			password: "testpassword" + (i + 1).toString()
		});
	}
}

// REMOVE: send 3 "account" messages from testuser2 to testuser1
function sendTestAccountMessages() {
	// drop table
	Messages.remove({});

	// test accounts
	var testuser1 = Meteor.users.findOne({username: "testuser1"});
	var testuser2 = Meteor.users.findOne({username: "testuser2"});
	var testuser3 = Meteor.users.findOne({username: "testuser3"});

	// insert messages
	for (var i = 0; i < 3; i++) {
		Messages.insert({
			recipientId: testuser1._id,
			recipientType: recepientTypes.ACCOUNT,
			id: Random.id(), 
			senderId: testuser2._id,
			createdAt: new Date(),
			content: "Message " + (i + 1).toString() + " from testuser2 to testuser1"
		});
	}
}

// REMOVE: send 3 "group" messages from testuser2 to testuser1 and testuser3
function sendTestGroupMessages() {
	// drop table
	Groups.remove({});

	// test accounts
	var testuser1 = Meteor.users.findOne({username: "testuser1"});
	var testuser2 = Meteor.users.findOne({username: "testuser2"});
	var testuser3 = Meteor.users.findOne({username: "testuser3"});

	// get a new group id numbers
	var newGroupId = Random.id();

	// insert messages
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
}

// server
if (Meteor.isServer) {
	// testing init
	// resetAccounts();
	sendTestAccountMessages();
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

	// event handlers
	Template.body.events({
		"click .logCurrentUser": function(event) {
      		event.preventDefault();	// don't submit
			console.log("Here is a log of the current user: ");
			console.log(Meteor.user());
		},
		"click .logUserAccountMessages": function(event) {
			event.preventDefault(); // don't submit
			userMessages = Messages.find({recipientId: Meteor.userId()}, {sort: {ts: -1}});
			console.log("Here is a log of the current user's messages: ");
			console.log(userMessages.fetch());
		},
		"click .logUserGroupMessages": function(event) {
			event.preventDefault(); // don't submit
			groupsUserIsIn = Groups.find({}).fetch();
			groupsUserIsIn = groupsUserIsIn.filter(function(d) {
				return d.accountIds.indexOf(Meteor.userId()) != -1;
			});
			console.log(groupsUserIsIn);
		}
    });
}

// meteor methods
Meteor.methods({
	
});
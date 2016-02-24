Messages = new Meteor.Collection("messages");

var recepientTypes = {
		ACCOUNT: 0,
		GROUP: 1
};

// server
if (Meteor.isServer) {
	// REMOVE: empty accounts and create 3 dummy users
	// Meteor.users.remove({});
	// for (var i = 0; i < 3; i++) {
	// 	Accounts.createUser({
	// 		username: "testuser" + (i + 1).toString(),
	// 		password: "testpassword" + (i + 1).toString()
	// 	});
	// }

	// REMOVE: send 3 dummy messages from testuser2 to testuser1
	testuser1 = Meteor.users.findOne({username: "testuser1"});
	testuser2 = Meteor.users.findOne({username: "testuser2"});
	Messages.remove({});
	for (var i = 0; i < 3; i++) {
		Messages.insert({
			recepientId: testuser1._id,
			recepientType: recepientTypes.ACCOUNT,
			id: Random.id(), 
			senderId: testuser2._id,
			createdAt: new Date(),
			content: "Message " + (i + 1).toString() + " from testuser2 to testuser1"
		});
	}
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
		"click .logUserMessages": function(event) {
			event.preventDefault(); // don't submit
			userMessages = Messages.find({recepientId: Meteor.userId()}, {sort: {ts: -1}});
			console.log("Here is a log of the current user's messages: ");
			console.log(userMessages.fetch());
		}
    });
}

// meteor methods
Meteor.methods({
	
});
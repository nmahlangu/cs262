// server
if (Meteor.isServer) {
	// empty accounts and create 3 dummy users
	Meteor.users.remove({});
	for (var i = 0; i < 3; i++) {
		Accounts.createUser({
			username: "testuser" + (i + 1).toString(),
			password: "testpassword" + (i + 1).toString()
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

	Template.body.events({
		"submit .logCurrentUser": function(event) {
			// Prevent default browser form submit
      		event.preventDefault();
			console.log(Meteor.user());
		},
    });
}

// meteor methods
Meteor.methods({
	
});
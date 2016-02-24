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
	Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
  });
}

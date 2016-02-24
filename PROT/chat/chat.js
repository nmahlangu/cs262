// server
if (Meteor.isServer) {
	Accounts.createUser({
		username: "testuser1",
		password: "testpassword1"
	});
}

// client
if (Meteor.isClient) {
	Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
  });
}

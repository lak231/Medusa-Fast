 //	add this line to html file to import parse <script src="https://npmcdn.com/parse/dist/parse.min.js"></script>
		Parse.initialize("a3Vzn4zfnMObdOfhNJJEdhiFaAdG62rz1Z8ictHmG");
		//Parse.serverURL = 'https://jtec-dev.us-east-1.elasticbeanstalk.com/parse'
		Parse.serverURL = 'https://server.jtecdesign.com/parse'
		var EyeData = Parse.Object.extend("EyeData")

		/*This function initializes a new userfor pushing data on the server*/
		function initializeUser(){
			if (Parse.User.current() != null){
				Parse.User.logOut();
			}
			var user = new Parse.User();
			username = makeid();
			user.set("username", username);
			user.set("password", "1")


			user.signUp(null, {
			  success: function(user) {
			    // Hooray! Let them use the app now.
			  },
			  error: function(user, error) {
			    // Show the error message somewhere and let the user try again.
			    alert("Error: " + error.code + " " + error.message);
			  }
			});

		}

		/*This function generates a random id that is used for the user*/
		function makeid(){
		    var text = "";
		    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		    for( var i=0; i < 10; i++ )
		        text += possible.charAt(Math.floor(Math.random() * possible.length));

		    return text;
		}

		/*This function pushes an x array, y arra, timestamp, screen size, valid, valid percent, and url to the server*/
		function pushData(x_array,y_array,timestamp_array, screen_size, valid, valid_percent,url){
			var newSet = new EyeData();
			var x_array = x_array || [];
			var y_array = y_array || [];
			var timestamp_array = timestamp_array || ["Timestamp Did Not Successfully Get Pushed"];
			var screen_size = screen_size || [];
			var valid = valid || null;
			var valid_percent = valid_percent || null;
			var url = url || ""

			newSet.set("user",Parse.User.current());
			newSet.set("x_array",x_array);
			newSet.set("y_array",y_array);
			newSet.set("timestamp_array",timestamp_array);
			newSet.set("screen_size", screen_size);
			newSet.set("valid", valid);
			newSet.set("valid_percent", valid_percent);
			newSet.set("url", url);


			newSet.save(null, {
				success: function(newSet) {
		        console.log(" user send");
				    // Execute any logic that should take place after the object is saved.
			//	  alert('New object created with objectId: ' + newSet.id);
				},
			    error: function(newSet, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and message.
				alert('Failed to create new object, with error code: ' + error.message);
				}
				});
		}

		/*This function logs out a user*/
		function logOut(){
			Parse.User.logOut();
		}
		/*This function generates random values*/
		function randomValue(){
			return Math.floor((Math.random() * 1000) + 1);
		}

var express 		= require("express"),
	mongoose 		= require("mongoose"),

	app 			= express(),
	bodyParser		= require("body-parser"),
	http 			= require("http").Server(app),
	io 				= require("socket.io")(http),
	
	Message 		= require("./models/message"),
	
	Conversation	= require("./models/conversation"),
	Meme 			= require("./models/meme")
	User 			= require("./models/user"),

	userMap 		= new Map();
// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;

// passport.use(new GoogleStrategy());
	
// mongoose.connect("mongodb://localhost/chat_app");
mongoose.connect("mongodb+srv://user1:hello123@cluster0.ziuz5.mongodb.net/lol1?retryWrites=true&w=majority");
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
const basicAuth = require('express-basic-auth')

app.use(basicAuth( { authorizer: myAuthorizer,
	unauthorizedResponse: getUnauthorizedResponse,
	challenge: true,
} ))


async function containsMatch(user, other) {
    var identifier = "";
    if (user.nickname > other.nickname) {
        identifier = user.nickname + "/" + other.nickname
    } else {
        identifier = other.nickname + "/" + user.nickname  
    }
	var conversation = await Conversation.findOne({users : identifier})
	// console.log(conversation)
    return conversation != null;
}

// function in(val, list) {
//     for (i=0; i<list.length; i++) {
// 		if (val.imageURL == list[i].imageURL) {
// 			return true
// 		}
// 	}
//     return false;
// }

function containsMeme(val, list) {
    for (i=0; i<list.length; i++) {
		if (val.imageURL == list[i].imageURL) {
			return true
		}
	}
    return false;
}

async function findMatches(userID) {
    var user = await User.findOne({nickname : userID});
    // let users = new Set();
    //Select 100 random users to match
	// console.log("USER " + user)

    var users = []
	for(let i = 0; i < 20; i++) {
        var count = await User.count()

		// Get a random entry
		var random = Math.floor(Math.random() * count)
		  
		// Again query all users but only fetch one offset by our random #
		var newUser = await User.findOne().skip(random)
		// console.log(newUser.nickname)
		// console.log(!containsMatch(newUser, users))
		// var isInList = containsMeme(newUser, users)
		var hasMatched = await containsMatch(newUser, user)
		  
        if (newUser.nickname != userID && !hasMatched) {
				
            users.push(newUser)
        }
    }

	var maxUser = null;
    let maxPoints = -10000;
	
	for (var i=0; i<users.length; i++) {
		var potentialUser = users[i]
		var points = -1000
		

		for (var j=0; j<potentialUser.likedMemes.length; j++) {
			if (containsMeme(potentialUser.likedMemes[j], user.likedMemes)) {
				points++;
			} else if (containsMeme(potentialUser.likedMemes[j], user.dislikedMemes)){
				points--;
			}
		}
		//Check for common disliked memes
		for (var j=0; j<potentialUser.dislikedMemes.length; j++) {
			if (containsMeme(potentialUser.dislikedMemes[j], user.likedMemes)) {
				points--;
			} else if (containsMeme(potentialUser.dislikedMemes[j], user.dislikedMemes)){
				points++;
			}
		}
		//Find the user with the max amount of points
		if (points > maxPoints) {
			maxPoints = points;
			maxUser = potentialUser;
		}
		
	}

	if (maxUser == null) {
		return null
	} else {
		return maxUser.nickname
	}
	
   
}

async function addreaction(userID, memeID, like) {
    let user = await User.findOne({nickname : userID});
    let meme = await Meme.findOne({imageURL : memeID})
	if (meme == null) {
		return
	}

	

    if (like) {
        user.likedMemes.push(meme);
    } else {
        user.dislikedMemes.push(meme);
    }
    await user.save();
}


async function getNewMeme(userID){
    let user = await User.findOne({nickname : userID});
    var meme = null;
    for(let i = 0; i < 50; i++) {
        var count = await Meme.count()

		// Get a random entry
		var random = Math.floor(Math.random() * count)
		  
		// Again query all users but only fetch one offset by our random #
		meme = await Meme.findOne().skip(random)
		  
        if (meme != null && !containsMeme(meme, user.likedMemes)
            && !containsMeme(meme, user.dislikedMemes)) {
				
                return meme.imageURL;
        }
    }
    return null;
}
 
async function myAuthorizer(username, password) {
	var newUser = await User.findOne({nickname: username}).exec();

	
	// console.log(newUser)
	if (newUser == null) {
		User.create({nickname: username,
			password: password, 
			matches: [],
			likedMemes: [],
			dislikedMemes: [],
			matchedWith: []
		}, 
		function(err, user){ 
			if (err) {
				return false
			} else {
				return true
			}

		})
	} else {

    	return password === newUser.password
	}
}

function getUnauthorizedResponse(req) {

    return req.auth
        ? ('Credentials ' + req.auth.user + ':' + req.auth.password + ' rejected')
        : 'No credentials provided'
}

app.get("/", function(req,res){
	res.render("landing");
});

app.get("/chatWithOthers", function(req,res){
	res.render("chatWithOthers", {activeUsers: activeUsers});
});

app.get("/memes", function(req, res) {
	res.render("memes", {username: req.auth.user});
});

app.get("/matches", async function(req, res) {
	// console.log(await User.findOne({nickname: req.auth.user}))
	var user = await User.findOne({nickname: req.auth.user})
	var matches = await user.matchedWith
	// console.log("USER MATCHED WITH " + matches)
	res.render("matches", {matches: matches });
	
});

app.get("/conversations/:otherNickname", async function(req, res) {
	// console.log(req.params.otherNickname)

	var identifier = "";
	if (req.auth.user > req.params.otherNickname) {
		identifier = req.auth.user + "/" + req.params.otherNickname
	} else {
		identifier = req.params.otherNickname + "/" + req.auth.user  
	}
	
	var conv = await Conversation.findOne({users: identifier})

	// console.log(conv)

	
	res.render("conversation", {username: req.auth.user, otherUsername: req.params.otherNickname, conversation: conv.messages});
	

	
	
});

app.get("/getNewMatch", async function(req,res){

	var user = await User.findOne({nickname: req.auth.user})
	var match = await findMatches(user.nickname)
	if (match != null) {
		user.matchedWith.push(match)
		var matchedUser = await User.findOne({nickname: match})

		matchedUser.matchedWith.push(user.nickname)

		user.save();
		matchedUser.save();

		var identifier = "";
		if (user.nickname > matchedUser.nickname) {
			identifier = user.nickname + "/" + matchedUser.nickname
		} else {
			identifier = matchedUser.nickname + "/" + user.nickname  
		}

		await Conversation.create({users: identifier, messages:[], _length: 0})
	}

	

	res.redirect("/matches");
});

app.get("/*", function(req,res){
	res.redirect("/");
});

io.on("connection", function(socket){

	// console.log(socket)

	//connect a new user, log connection
	// console.log("New user connected");

    
    // log new socket added
	socket.username = socket.request._query["username"];
	// console.log(socket.username);
	socket.isConnected = false;

    // add user to the map of active users
	userMap.set(socket.username, socket);

	// console.log(socket.username + ' connected');
	// console.log(userMap)



    // PRE: the user is valid and a string
    socket.on("startDialog", async function(user){
        socket.partner = user;
		// console.log(socket.partner)

        // get the conversation        
        var identifier = "";
        if (socket.username > user) {
            identifier = socket.username + "/" + user
        } else {
            identifier = user + "/" + socket.username  
        }
        socket.conversation = await Conversation.findOne({users: identifier});
		// console.log(socket.conversation)

    })


	// PRE: memeliked is a string of memeurl
	socket.on("reactToMeme", function(memeReaction) {
		addreaction(socket.username, memeReaction.memeID, memeReaction.reaction);
	})

	socket.on("getNewMeme", async function(){
		var meme = await getNewMeme(socket.username);
		socket.emit("postNewMeme", meme);
	})

    // PRE: msg is a String
	socket.on("newMessage", function(msg){
		// console.log(userMap.keys())
		// console.log(socket.partner)
        if (userMap.has(socket.partner)){
			// console.log("yay")
            try {
                userMap.get(socket.partner).emit("newMessage",msg);
            } catch {}
        }

        // create new date
		var date = new Date();

        // Add to new database:
		socket.conversation.messages.push({text: msg, author: socket.username,timestamp: date.toUTCString()});
		socket.conversation._length += 1;
		socket.conversation.save(function(err, conversation){
			if(err){
				console.log(err);
			}
		});
	});

    
	socket.on('disconnect', function(){
		console.log(socket.username + ' disconnected');
		try {
            userMap.delete(socket.username)
        } catch {}
	});

});


http.listen(process.env.PORT || 3000, function(){
	console.log("Server online");
});
var express 		= require("express"),
	mongoose 		= require("mongoose"),

	app 			= express(),
	bodyParser		= require("body-parser"),
	http 			= require("http").Server(app),
	io 				= require("socket.io")(http),
	
	Message 		= require("./models/message"),
	
	Conversation	= require("./models/conversation"),
	Match 			= require("./models/match"),
	Meme 			= require("./models/meme")
	User 			= require("./models/user"),


	activeUsers 	= 0,
	userCue 		= [];
// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;

// passport.use(new GoogleStrategy());
	
mongoose.connect("mongodb://localhost/chat_app");
// mongoose.connect("mongodb://Jordan:HelloThere12345@ds217092.mlab.com:17092/chatapp");
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
const basicAuth = require('express-basic-auth')

app.use(basicAuth( { authorizer: myAuthorizer,
	unauthorizedResponse: getUnauthorizedResponse,
	challenge: true,
} ))

app.use(function(req, res, next) {
    var user = auth(req);

    if (user === undefined || user['name'] !== 'username' || user['pass'] !== 'password') {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
        res.end('Unauthorized');
    } else {
        next();
    }
});
 
async function myAuthorizer(username, password) {
	var newUser = await User.findOne({nickname: username}).exec();

	
	console.log(newUser)
	if (newUser == null) {
		User.create({nickname: username,
			password: password, 
			matches: [],
			likedMemes: [],
			dislikedMemes: []}, 
			function(err, user){ 
				if (err) {
					return false
				} else {
					return true
				}

		})
	} else {
		console.log(newUser.password)
		console.log(password)
		console.log(newUser.password === password)

    	return password === newUser.password
	}
}

function getUnauthorizedResponse(req) {
	console.log("autorized")
	console.log(req)

    return req.auth
        ? ('Credentials ' + req.auth.user + ':' + req.auth.password + ' rejected')
        : 'No credentials provided'
}

app.get("/", function(req,res){
	res.render("matches", {matches: [{nickname: "bruh"}, {nickname: "dude"}]});
});

app.get("/chatWithOthers", function(req,res){
	res.render("chatWithOthers", {activeUsers: activeUsers});
});

app.get("/*", function(req,res){
	res.redirect("/");
});

io.on("connection", function(socket){

	//connect a new user, log connection
	console.log("New user connected");

	socket.username = socket.request._query["username"];
	console.log(socket.username);

	socket.isConnected = false;
	userCue.push(socket);
	activeUsers += 1;

	pair();

	console.log("Users online: " + activeUsers.toString());


	socket.on("newMessage", function(msg){
		try {
			socket.partner.emit("newMessage", msg);
		} catch (e) {
			try {
				socket.partner.emit("partnerDisconnect");
				socket.disconnect();
			} catch (e) {}	
		}
		

		var date = new Date();

		socket.convo.messages.push({text: msg, author: socket.username,timestamp: date.toUTCString()});
		socket.convo._length += 1;
		socket.convo.save(function(err, convo){
			if(err){
				console.log(err);
			} else {
				console.log(convo);
			}
		});
	});


	socket.on('disconnect', function(){
		console.log('User disconnected');
		var index = userCue.indexOf(socket);
		if (index > -1) {
			userCue.splice(index, 1);
		}
		activeUsers -= 1;
		try {
			socket.partner.emit("partnerDisconnect");
		} catch (e) {}
	});

});


http.listen(process.env.PORT || 3000, function(){
	console.log("Server online");
});


function pair() {
	while (userCue.length >= 2) {
		user1 = userCue.shift();
		user2 = userCue.shift();

		user1.partner = user2;
		user2.partner = user1;

		user1._id = 0;
		user2._id = 1;

		partnerConversation = Conversation.create({messages:[],_length:0}, function(err, convo){
			if (err){
				console.log(err);
				userCue.push(user1);
				userCue.push(user2);
			} else {
				user1.convo = convo;
				user2.convo = convo;

				user1.emit("start", {partnerName:user2.username});
				user2.emit("start", {partnerName:user1.username});
			}
		});
	}
}
var mongoose 		= require("mongoose"),

	Meme 			= require("./models/meme"),

	addreaction 	= require("./memeLiker")
	getNewMeme 	= require("./memeGetter")
// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;

// passport.use(new GoogleStrategy());
	
// mongoose.connect("mongodb://localhost/chat_app");
mongoose.connect("mongodb+srv://user1:hello123@cluster0.ziuz5.mongodb.net/lol1?retryWrites=true&w=majority");

Meme.create({memeId: "https://i.redd.it/28frb7wkknp61.png", subreddit:"", imageURL: "https://i.redd.it/28frb7wkknp61.png"})
Meme.create({memeId: "https://i.redd.it/7bpighqbjnp61.jpg", subreddit:"", imageURL: "https://i.redd.it/7bpighqbjnp61.jpg"})
Meme.create({memeId: "https://i.redd.it/qn035rhkthp61.jpg", subreddit:"", imageURL: "https://i.redd.it/qn035rhkthp61.jpg"})
Meme.create({memeId: "https://i.redd.it/4fzspagyuwv31.jpg", subreddit:"", imageURL: "https://i.redd.it/4fzspagyuwv31.jpg"})

var mongoose 	= require("mongoose");

memeSchema = mongoose.Schema({
	memeId: String,
    subreddit: String,
    imageURL: String
});

var random = require('mongoose-simple-random');
memeSchema.plugin(random);

module.exports = mongoose.model("Meme", memeSchema);
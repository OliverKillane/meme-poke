var mongoose 	= require("mongoose");

userSchema = mongoose.Schema({
	nickname: String,
    password: String,
    likedMemes: [memeSchema],
    dislikedMemes: [memeSchema],
    matchedWith: [String]
});

var random = require('mongoose-simple-random');
userSchema.plugin(random);

module.exports = mongoose.model("User", userSchema);
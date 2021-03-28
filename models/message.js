var mongoose 	= require("mongoose");

messageSchema = mongoose.Schema({
	text: String,
	author: String,
	timestamp: String
});

module.exports = mongoose.model("Message", messageSchema);

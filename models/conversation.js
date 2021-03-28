var mongoose 	= require("mongoose");

conversationSchema = mongoose.Schema({
	users: String,
	messages: [messageSchema],
	_length: Number
});

module.exports = mongoose.model("Conversation", conversationSchema);
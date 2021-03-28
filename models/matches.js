var mongoose 	= require("mongoose");

conversationSchema = mongoose.Schema({
	messages: [messageSchema],
	_length: Number
});

module.exports = mongoose.model("Match", conversationSchema);
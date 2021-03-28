// const mongoose = require('mongoose');
// mongoose.connect('mongodb+srv://UserDB:<MemePoke69420>@cluster0.1qwru.mongodb.net/MemePokeDB?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});

var Meme = require('./models/meme');
var User = require('./models/user');


async function addreaction(userID, memeID, like) {
    let user = await User.findOne({nickname : userID});
    let meme = await Meme.findOne({memeId : memeID})
    if (like) {
        user.likedMemes.push(meme);
    } else {
        user.dislikedMemes.push(meme);
    }
    await user.save();
}
module.exports = addreaction
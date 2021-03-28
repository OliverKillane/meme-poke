// const mongoose = require('mongoose');
// mongoose.connect('mongodb+srv://UserDB:<MemePoke69420>@cluster0.1qwru.mongodb.net/MemePokeDB?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});

require('./matcher');
var Meme = require('./models/meme');
var User = require('./models/user');



async function getNewMeme(userID){
    let user = await User.findOne({nickname : userID});
    let meme = null;
    for(let i = 0; i < 50; i++) {
        Meme.findOneRandom(function(err, result) {
            if (!err) {
              meme = result;
            }
        });
        if (!matcher.containsMeme(meme, user.likedMemes)
            && !matcher.containsMeme(meme, user.dislikedMemes)) {
                return meme.imageURL;
        }
    }
    return null;
}

module.exports = getNewMeme

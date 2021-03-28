// const { Schema, mongo, Mongoose } = require("mongoose")
// require("/models")
// Mongoose.connect('mongodb+srv://UserDB:<MemePoke69420>@cluster0.1qwru.mongodb.net/MemePokeDB?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});

var Meme = require('./models/meme');
var User = require('./models/user');

var Users = require('./models/user');
var Conversation = require('./conversation');
Users.plugin(random);

function containsMatch(user, other) {
    var identifier = "";
    if (user.username > other.username) {
        identifier = user.username + "/" + other.username
    } else {
        identifier = other.username + "/" + user.username  
    }
    return Conversation.find({users : identifier}) != null;
}

function containsMeme(val, list) {
    list.forEach(element => {
        if (val.memeID == element.memeID) {
            return true;
        }
    });
    return false;
}

function findMatches(userID) {
    let user = Users.find({nickname : userID});
    let users = new Set();
    //Select 100 random users to match
    Users.findRandom({}, {}, {limit: 100}, function(err, results) {
    if (!err) {
      users.add(results);
    }
    });
    let maxUser = null;
    let maxPoints = 0;
    users.forEach((value, _valueAgain) => {
        let points = 0;
        //Check if users have already matched before
       if (containsMatch(user, value)) {
            points = -10000;
       } else {
        //Check for common liked memes
       key.likedMemes.forEach(element => {
           if (containsMeme(element, user.likedMemes)) {
               points++;
           } else if (containsMeme(element, user.dislikedMemes)){
               points--;
           }
        });
        //Check for common disliked memes
        key.dislikedMemes.forEach(element => {
           if (containsMeme(element, user.likedMemes)) {
               points--;
           } else if (containsMeme(element, user.dislikedMemes)){
               points++;
           }
       });
       //Find the user with the max amount of points
       if (points > maxPoints) {
           maxPoints = points;
           maxUser = value;
       }
     }   
   });
   return maxUser.nickname;
}

const db = Mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function findMatches(userID){
    let user = Users.find({nickname : userID});
    let users = new Set();
    //Select 100 random users to match
    Users.findRandom({}, {}, {limit: 100}, function(err, results) {
    if (!err) {
      users.add(results);
    }
    });
    let maxUser = null;
    let maxPoints = 0;
    users.forEach((value, _valueAgain) => {
        let points = 0;
        //Check if users have already matched before
       if (containsMatch(user, value)) {
            points = -10000;
       } else {
        //Check for common liked memes
       key.likedMemes.forEach(element => {
           if (containsMeme(element, user.likedMemes)) {
               points++;
           } else if (containsMeme(element, user.dislikedMemes)){
               points--;
           }
        });
        //Check for common disliked memes
        key.dislikedMemes.forEach(element => {
           if (containsMeme(element, user.likedMemes)) {
               points--;
           } else if (containsMeme(element, user.dislikedMemes)){
               points++;
           }
       });
       //Find the user with the max amount of points
       if (points > maxPoints) {
           maxPoints = points;
           maxUser = value;
       }
     }   
   });
   return maxUser.nickname;
});
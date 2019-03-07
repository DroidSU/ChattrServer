var admin = require('firebase-admin')

// let FIREBASE_USERS_TABLE = 'Users'
let FIREBASE_PHONE_NUMBERS_TABLE = 'Phone Numbers'
// let FIREBASE_CHATS_TABLE = 'Chats'
let FRIEND_CREATED = 'FRIEND_CREATED'

var db = admin.database()
// var ref = db.ref(FIREBASE_USERS_TABLE)
var phoneRef = db.ref(FIREBASE_PHONE_NUMBERS_TABLE)
// var chatRef = db.ref(FIREBASE_CHATS_TABLE)

// var chatFunctions = (io) => {
//   io.on('connection', (socket) => {
//     getFriendDetails(socket, io)
//   })
// }

// function getFriendDetails (socket, io) {
//   socket.on('sendFriendDetails', (data) => {
//     console.log(data)
//     var userRef = phoneRef.child(data.friendNumber)
//     userRef.once('value', (snapshot) => {
//       Object.keys(io.sockets.sockets).forEach((id) => {
//         if (id === socket.id) {
//           var friendObject = {
//             friendUsername: snapshot.val().Username,
//             friendMobNumber: data.friendNumber
//           }
//           console.log(friendObject)
//           io.to(id).emit(FRIEND_CREATED, friendObject)
//         }
//       })
//     })
//   })
// }

module.exports = {
  // chatFunctions
}

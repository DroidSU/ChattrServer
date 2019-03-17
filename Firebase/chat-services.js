var app = require('express')
var http = require('http').Server(app)
var io = require('socket.io')(http)
var admin = require('firebase-admin')
var FCM = require('fcm-push')
var firebase_functions = require('firebase-functions')

let SEND_CHAT_MESSAGE_EVENT = 'SEND_CHAT_MESSAGE_EVENT'
let NEW_MESSAGE_RECEIVED = 'NEW_MESSAGE_RECEIVED'
let FIREBASE_CHATS_TABLE = 'Chats'
let FIREBASE_NEW_CHATS_TABLE = 'NewMessageIds'
let FIREBASE_USERS_TABLE = 'Users'

var serverKey = 'AAAAsaS7MwQ:APA91bHtqDmOBfWmk9vk_6EzTEccqkz7Jn4Q6TiIw6XZjIL7wM5aVs3W6qBW2a0M0_W5V84rUep49j96BYsEOo9Z6re5DbJEiqls1uNZeco9-iuRn5ryF-Za_D4kULtGFaA4Nrpu3GAU'
var fcm = new FCM(serverKey)
var db = admin.database()
var usersRef = db.ref(FIREBASE_USERS_TABLE)
var chatsRef = db.ref(FIREBASE_CHATS_TABLE)
var newChatsRef = db.ref(FIREBASE_NEW_CHATS_TABLE)

var chatServicesRequests = (io) => {
  io.on('connection', (socket) => {
    notifyNewMessage(socket, io)
  })
}

function notifyNewMessage (socket, io) {
  socket.on(SEND_CHAT_MESSAGE_EVENT, (data) => {
    var userNewChatRef = newChatsRef.child(data.chattrBoxId)
    userNewChatRef.set({
      NewMessageId: data.chatId
    }).then(() => {
      var userChatRef = chatsRef.child(data.chattrBoxId).child(data.chatId)
      userChatRef.set({
        chatId: data.chatId,
        message: data.chatBody,
        sender_username: data.sender_username,
        receiver_username: data.receiver_username,
        date: data.date
      })
    })
      .then(() => {
        var tokenRef = usersRef.child(data.receiver_username).child('InstanceID')
        tokenRef.once('value', (snapshot) => {
          console.log(snapshot.val())
          var message = {
            to: snapshot.val(),
            data: {
              title: 'Chattr',
              body: `New chat received from ${data.sender_username}`,
              sender: data.sender_username,
              receiver: data.receiver_username
            }
          }

          console.log('About to send message')
          console.log(`${data.sender_username} this is the sender`)
          // fcm.send(message)
          //   .then((response) => {
          //     console.log('Message sent')
          //   })
          //   .catch((err) => {
          //     console.log(err)
          //   })
          fcm.send(message, function (err, response) {
            if (err) {
              console.log(err)
            } else {
              console.log('Message sent')
            }
          })
        })
      })
      .catch((err) => {
        console.log(err)
      })
  })
}

module.exports = {
  chatServicesRequests
}

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

var serverKey = 'AAAAsaS7MwQ:APA91bHtqDmOBfWmk9vk_6EzTEccqkz7Jn4Q6TiIw6XZjIL7wM5aVs3W6qBW2a0M0_W5V84rUep49j96BYsEOo9Z6re5DbJEiqls1uNZeco9-iuRn5ryF-Za_D4kULtGFaA4Nrpu3GAU'
var db = admin.database()
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
      }).then(() => {
        var eventName = data.chattrBoxId
        Object.keys(io.sockets.sockets).forEach((id) => {
          if (id === socket.id) {
            io.to(id).emit(eventName, data)
          }
        })
      })
        .catch((error) => {
          console.log(error.message)
        })
    })
  })
}

module.exports = {
  chatServicesRequests
}

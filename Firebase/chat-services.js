var app = require('express')
var http = require('http').Server(app)

var io = require('socket.io')(http)

var admin = require('firebase-admin')
var FCM = require('fcm-push')
var serverKey = 'AAAAsaS7MwQ:APA91bHtqDmOBfWmk9vk_6EzTEccqkz7Jn4Q6TiIw6XZjIL7wM5aVs3W6qBW2a0M0_W5V84rUep49j96BYsEOo9Z6re5DbJEiqls1uNZeco9-iuRn5ryF-Za_D4kULtGFaA4Nrpu3GAU'

var chatServicesRequests = (io) => {
  io.on('connection', (socket) => {
    console.log('connected to chatServices')
  })
}

module.exports = {
  chatServicesRequests
}

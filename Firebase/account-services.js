var admin = require('firebase-admin')

let REGISTRATION_FAILED_MESSAGE = 'REGISTRATION_FAILED'
let REGISTRATION_SUCCESS_MESSAGE = 'REGISTRATION_SUCCESS'
let REGISTRATION_COMPLETE_EVENT = 'REGISTRATION_COMPLETE'
let FIREBASE_AUTH_TOKEN_GENERATED = 'FIREBASE_AUTH_TOKEN_GENERATED'
let FRIEND_CREATED = 'FRIEND_CREATED'
let FIREBASE_USERS_TABLE = 'Users'
let FIREBASE_PHONE_NUMBERS_TABLE = 'Phone Numbers'

var db = admin.database()
var ref = db.ref(FIREBASE_USERS_TABLE)
var phoneRef = db.ref(FIREBASE_PHONE_NUMBERS_TABLE)

var userAccountCreateRequests = (io) => {
  io.on('connection', (socket) => {
    registerUser(socket, io)
    // detectDisconnection(socket, io)
    logInUser(socket, io)
    changeStatusOffline(socket, io)
    changeStatusOnlne(socket, io)
    getFriendDetails(socket, io)
  })
}

function registerUser (socket, io) {
  socket.on('userData', (data) => {
    admin.auth().createUser({
      email: data.email,
      password: data.password,
      displayName: data.username
    })
      .then((userRecord) => {
        console.log(`${data.email} was registered successfully`)
        var userRef = ref.child(data.username)
        userRef.set({
          Email: data.email,
          UserName: data.username,
          MobNumber: data.mobNumber,
          IsOnline: false
        })

        var userPhoneRef = db.ref(FIREBASE_PHONE_NUMBERS_TABLE).child(data.mobNumber)
        userPhoneRef.set({
          Email: data.email,
          Username: data.username
        })

        Object.keys(io.sockets.sockets).forEach((id) => {
          if (id === socket.id) {
            io.to(id).emit(REGISTRATION_COMPLETE_EVENT, REGISTRATION_SUCCESS_MESSAGE)
          }
        })
      })
      .catch((error) => {
        Object.keys(io.sockets.sockets).forEach((id) => {
          if (id === socket.id) {
            io.to(id).emit(REGISTRATION_COMPLETE_EVENT, REGISTRATION_FAILED_MESSAGE)
            console.log(error.message)
          }
        })
      })
  })
}

function logInUser (socket, io) {
  socket.on('userInfo', (data) => {
    admin.auth().getUserByEmail(data.email)
      .then((userRecord) => {
        var userRef = ref.child(userRecord.displayName)

        userRef.once('value', (snapshot) => {
          var additionalClaims = {
            email: data.email
          }

          admin.auth().createCustomToken(userRecord.uid, additionalClaims)
            .then((customToken) => {
              Object.keys(io.sockets.sockets).forEach((id) => {
                if (id === socket.id) {
                  var token = {
                    authToken: customToken,
                    email: snapshot.val().Email,
                    displayName: snapshot.val().UserName,
                    mobNumber: snapshot.val().MobNumber
                  }
                  console.log(data.email + ' logged in')
                  io.to(id).emit(FIREBASE_AUTH_TOKEN_GENERATED, token)
                }
              })
            }).catch((error) => {
              Object.keys(io.sockets.sockets).forEach((id) => {
                if (id === socket.id) {
                  var token = {
                    authToken: error.message,
                    email: 'error',
                    displayName: 'error',
                    mobNumber: 'error'
                  }
                  console.log(error.message)
                  io.to(id).emit(FIREBASE_AUTH_TOKEN_GENERATED, token)
                }
              })
            })
        })
      })
      .catch((error) => {
        console.log(error.message)
      })
  })
}

function changeStatusOffline (socket, io) {
  socket.on('statusOffline', (data) => {
    var onlineStatusRef = ref.child(data.displayName).child('IsOnline')
    onlineStatusRef.set(false)
  })
}

function changeStatusOnlne (socket, io) {
  socket.on('statusOnline', (data) => {
    var onlineStatusRef = ref.child(data.displayName).child('IsOnline')
    onlineStatusRef.set(true)
  })
}

function getFriendDetails (socket, io) {
  socket.on('sendFriendDetails', (data) => {
    var userRef = phoneRef.child(data.friendNumber)

    userRef.once('value', (snapshot) => {
      Object.keys(io.sockets.sockets).forEach((id) => {
        if (id === socket.id) {
          var friendObject = {
            friendUsername: snapshot.val().Username,
            friendMobNumber: data.friendNumber
          }
          io.to(id).emit(FRIEND_CREATED, friendObject)
        }
      })
    })
  })
}

module.exports = {
  userAccountCreateRequests
}

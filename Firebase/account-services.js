var admin = require('firebase-admin')

let REGISTRATION_FAILED_MESSAGE = 'REGISTRATION_FAILED'
let REGISTRATION_SUCCESS_MESSAGE = 'REGISTRATION_SUCCESS'
let REGISTRATION_COMPLETE_EVENT = 'REGISTRATION_COMPLETE'
let FIREBASE_AUTH_TOKEN_GENERATED = 'FIREBASE_AUTH_TOKEN_GENERATED'
let FIREBASE_USERS_TABLE = 'Users'
let FIREBASE_PHONE_NUMBERS_TABLE = 'Phone Numbers'

var userAccountCreateRequests = (io) => {
  io.on('connection', (socket) => {
    registerUser(socket, io)
    detectDisconnection(socket, io)
    logInUser(socket, io)
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

        var db = admin.database()
        var ref = db.ref(FIREBASE_USERS_TABLE)
        var userRef = ref.child(data.username)
        userRef.set({
          Email: data.email,
          UserName: data.username,
          MobNumber: data.mobNumber,
          IsOnline: false
        })

        var userStatusRef = db.ref(FIREBASE_PHONE_NUMBERS_TABLE).child(data.mobNumber)
        userStatusRef.set({
          Email: data.email
        })

        Object.keys(io.sockets.sockets).forEach((id) => {
          if (id === socket.id) {
            io.to(id).emit(REGISTRATION_COMPLETE_EVENT,REGISTRATION_SUCCESS_MESSAGE)
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
        console.log(userRecord)
        var db = admin.database()
        var ref = db.ref(FIREBASE_USERS_TABLE)
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
                    displayName: snapshot.val().UserName
                  }
                  io.to(id).emit(FIREBASE_AUTH_TOKEN_GENERATED, token)
                }
              })
            }).catch((error) => {
              Object.keys(io.sockets.sockets).forEach((id) => {
                if (id === socket.id) {
                  var token = {
                    authToken: error.message,
                    email: 'error',
                    displayName: 'error'
                  }
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

function detectDisconnection (socket, io) {
  socket.on('disconnect', () => {
  })
}

module.exports = {
  userAccountCreateRequests
}

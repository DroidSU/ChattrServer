var app = require('express')() // this line gives the variable app a server framework
var http = require('http').Server(app) // used to connect to the Server
var io = require('socket.io')(http)
var admin = require('firebase-admin')

const { port } = require('./config')

// Get the firebase credentials from the private folder
var path = require('path')
var chattrServiceAccountPath = path.join(__dirname, 'private', 'chattrServiceCredentials.json')
// require(__dirname + '/private/chattrServiceCredentials.json')

// Initialise the firebase credentials of the app.
admin.initializeApp({
  credential: admin.credential.cert(chattrServiceAccountPath),
  databaseURL: 'https://chattr-d500d.firebaseio.com'
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

/*
  This uses an arrow function, new way to define a function.
*/
http.listen(port || 3000, () => {
  console.log('Server is listening on port ' + port)
})

// Moved socket code from server.js to account-services.js and called from server.js
var accountRegistrationReq = require('./Firebase/account-services')
accountRegistrationReq.userAccountCreateRequests(io)

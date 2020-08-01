const express = require('express')
const app = express()
const server = require('http').Server(app)      // this allows us to create a server to be used with socket.io
const io = require('socket.io')(server)         // socketio now knows about out server
const uuid = require('uniqid')
// const{ v4: uuidV4 } = require('uuid')           // rename v4 to uuidV4

const port = process.env.PORT || 3000

app.set('view engine', 'ejs')                   // how to render views
app.use(express.static('public'))               // all js and css in public folder
app.use(express.static(__dirname + '/views'));

app.get('/', (req, res) => {                    // request, response
    // res.redirect(`/${uuidV4()}`)
    res.redirect(`/index.html`)
})

app.get('/create', (req, res) => {              // custom room
    res.redirect(`/${uuid.process()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })     // get room from room parameter in the above line (url)
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {        // send roomId to front-end code
        socket.join(roomId)                             // anything that happens in the roomId in notified via socket
        socket.to(roomId).broadcast.emit('user-connected', userId)      // notifying other users that someone has joined
        // user connected is an event, which is being listened in script.js
        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })        
    })
})

// server.listen(3000)
server.listen(port, () => {
    console.log('Server runninng at http://localhost:3000')
})
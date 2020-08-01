const socket = io('/')          // root path
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    // host: '/',
    host: 'peerjs-server31.herokuapp.com',
    secure: true,
    port: 443
})

const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {         
        connectToNewUser(userId, stream)            // to allow ourselves to be connected to others when we connect
    })
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)            // sending my video stream
    const video = document.createElement('video')       
    call.on('stream', userVideoStream => {              // receiving others' video stream
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call                                // keeping track of the connected users to disconnect themm later
}

socket.on('user-disconnected', userId => {
    if(peers[userId])
        peers[userId].close()
})

// socket.on('user-connected', userId => {
//     console.log('user-connected: ' + userId)
// })
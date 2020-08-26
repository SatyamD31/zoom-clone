const socket = io('/')          // root path
const videoGrid = document.getElementById('video-grid')
var peer = new Peer(undefined, {
    // host: 'peerjs-server.herokuapp.com',
    // secure: true,
    // port: 443
    path: '/peerjs',
    host: '/',
    port: '443'
})

let myVideoStream;

const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', (userId) => {         
        connectToNewUser(userId, stream)
    })

    // display messages========================================================================
    let msg = $('input')

    $('html').keydown((e) => {
        // get the input value when enter is pressed as there is no submit button
        if(e.which == 13 && msg.val().length != 0) {
            socket.emit('message', msg.val());
            msg.val('')
        }
    })

    socket.on('createMessage', message => {
        $('ul').append(`<li class="message"><strong>user</strong><br>${message}</li>`);
        scrollToBottom();
    })
})

const scrollToBottom = () => {
    let d = $('.main__chatWindow');
    d.scrollTop(d.prop("scrollHeight"));
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')       
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

socket.on('user-disconnected', userId => {
    if(peers[userId])
        peers[userId].close()
})

// Mute Unmute function===============================================================
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if(enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    }
    else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
        <i class="fa fa-microphone"></i>
        <span>Mute</span>
    `
    document.querySelector('.main__muteButton').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
        <i class="fa fa-microphone-slash unmute"></i>
        <span>Unmute</span>
    `
    document.querySelector('.main__muteButton').innerHTML = html;
}

// Hide Show video function===============================================================
const hideShow = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if(enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setShowVideo()
    }
    else {
        setHideVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setHideVideo = () => {
    const html = `
        <i class="fa fa-video"></i>
        <span>Hide Video</span>
    `
    document.querySelector('.main__videoButton').innerHTML = html;
}

const setShowVideo = () => {
    const html = `
        <i class="fa fa-video-slash pause"></i>
        <span>Show Video</span>
    `
    document.querySelector('.main__videoButton').innerHTML = html;
}
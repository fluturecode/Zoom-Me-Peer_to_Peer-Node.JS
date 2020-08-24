// JavaScript for front end lives here

// Import socketio
const socket = io("/");
// Get video grid
const videoGrid = document.getElementById("video-grid");
console.log(videoGrid);
// Create a video element
const myVideo = document.createElement("video");
// Mute your own video
myVideo.muted = true;

// Create a peer connectoin
var peer = new Peer(undefined, {
	path: "/peerjs",
	host: "/",
	port: "3030",
});

let myVideoStream;

const peers = {};
// Allows your device to get video/audiof output from the browser
navigator.mediaDevices
	.getUserMedia({
		video: true,
		audio: false,
	})
	.then((stream) => {
		// Video stream comes from the promise
		myVideoStream = stream;
		addVideoStream(myVideo, stream);

		peer.on("call", (call) => {
			call.answer(stream);
			const video = document.createElement("video");
			call.on("stream", (userVideoStream) => {
				addVideoStream(video, userVideoStream);
			});
		});

		// Listen on user connected
		socket.on("user-connected", (userId) => {
			connectToNewUser(userId, stream);
		});
		// input value
		let text = $("input");
		// when press enter send message
		$("html").keydown(function (e) {
			if (e.which == 13 && text.val().length !== 0) {
				socket.emit("message", text.val());
				text.val("");
			}
		});
		socket.on("createMessage", (message) => {
			$("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
			scrollToBottom();
		});
	});

socket.on("user-disconnected", (userId) => {
	if (peers[userId]) peers[userId].close();
});

// Listen on Peer connection, id is generated here
peer.on("open", (id) => {
	socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
	// Call connected user, send stream, create new video element, and connect their video stream
	const call = peer.call(userId, stream);
	const video = document.createElement("video");
	call.on("stream", (userVideoStream) => {
		addVideoStream(video, userVideoStream);
	});
	call.on("close", () => {
		video.remove();
	});

	peers[userId] = call;
};

const addVideoStream = (video, stream) => {
	video.srcObject = stream;
	//when data loads, play the video
	video.addEventListener("loadmetadata", () => {
		video.play();
	});
	// Add the video to the video grid
	videoGrid.append(video);
};

const scrollToBottom = () => {
	var d = $(".main__chat_window");
	d.scrollTop(d.prop("scrollHeight"));
};

const muteUnmute = () => {
	const enabled = myVideoStream.getAudioTracks()[0].enabled;
	if (enabled) {
		myVideoStream.getAudioTracks()[0].enabled = false;
		setUnmuteButton();
	} else {
		setMuteButton();
		myVideoStream.getAudioTracks()[0].enabled = true;
	}
};

const playStop = () => {
	console.log("object");
	let enabled = myVideoStream.getVideoTracks()[0].enabled;
	if (enabled) {
		myVideoStream.getVideoTracks()[0].enabled = false;
		setPlayVideo();
	} else {
		setStopVideo();
		myVideoStream.getVideoTracks()[0].enabled = true;
	}
};

const setMuteButton = () => {
	const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
	document.querySelector(".main__mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
	const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
	document.querySelector(".main__mute_button").innerHTML = html;
};

const setStopVideo = () => {
	const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
	document.querySelector(".main__video_button").innerHTML = html;
};

const setPlayVideo = () => {
	const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
	document.querySelector(".main__video_button").innerHTML = html;
};

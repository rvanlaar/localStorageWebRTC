console.log('receiver: loaded');
localStorage.setItem('receiver-ice', JSON.stringify([]));

var pc_config = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
var pc_constraints = {"optional": [{RtpDataChannels: true}]}

var peerConnection = new RTCPeerConnection(pc_config, pc_constraints);


function icecallback(event) {
	console.log('receiver: icecallback');
	if (event.candidate !== null) {
		var item = JSON.parse(localStorage.getItem('receiver-ice'));
		item.push(event.candidate);
		localStorage.setItem('receiver-ice', JSON.stringify(item));
		console.log('reciever: ice: ' + JSON.stringify(event.candidate));
	}
}

var dataChannelOptions = {
	ordered: true, // do guarantee order
	reliable: false
};

var dataChannel = peerConnection.createDataChannel(
	"toBoard", dataChannelOptions);

dataChannel.onmessage = receiveData;

dataChannel.onopen = function () {
    dataChannel.send('receiver: first text message over RTP data ports');
};

peerConnection.onicecandidate = icecallback;

function setRemoteDescription() {
	console.log('receiver: set remote description');
	var sdp = JSON.parse(localStorage.getItem("sender-sdp"));
	desc = new RTCSessionDescription(sdp);
	peerConnection.setRemoteDescription(desc);

}
setRemoteDescription();

function createAnswer(){
	console.log('receiver: createAnswer');
	peerConnection.createAnswer(function (sessionDescription) {
		peerConnection.setLocalDescription(sessionDescription);
		localStorage.setItem("receiver-sdp", JSON.stringify(sessionDescription));
	})
}
createAnswer();

function connectIce(){
	console.log('receiver: Create ICE');
	var senderIce = JSON.parse(localStorage.getItem('sender-ice'));
	var iceLength = senderIce.length;
	for (var i = 0; i < iceLength; i++) {
		console.log('receiver: Add ICE');
		peerConnection.addIceCandidate(new RTCIceCandidate(senderIce[i]));
	}
}
connectIce();

//Non WebRTC code
var receiveText = document.getElementById('dataChannelReceive');

function receiveData(event) {
	receiveText.value = event.data;
	console.log('receiver: received: ' + event.data);
}

var clearButton = document.getElementById('clearButton');
clearButton.onclick = clearData;

function clearData() {
	receiveText.value = '';
}

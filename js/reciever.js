var pc_config = {"iceServers": [{"urls": "stun:stun.l.google.com:19302"}]};
var pc_constraints = {"optional": [{RtpDataChannels: true}]}

var peerConnection = new RTCPeerConnection(pc_config, pc_constraints);


function icecallback(event) {
	if (event.candidate !== null) {
		var item = JSON.parse(localStorage.getItem('receiver-ice'));
		item.push(event.candidate);
		localStorage.setItem('receiver-ice', JSON.stringify(item));
		log('icecallback: ' + JSON.stringify(event.candidate));
	} else {
		log("icecallback: null");
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
	log('parse SDP from sender');
	var sdp = JSON.parse(localStorage.getItem("sender-sdp"));
	log('create a new SDP object with sender SDP');
	desc = new RTCSessionDescription(sdp);
	log('set remote sessionDescription');
	peerConnection.setRemoteDescription(desc);

}

function createAnswer(){
	log('createAnswer');
	peerConnection.createAnswer(function (sessionDescription) {
		log(JSON.stringify(sessionDescription));
		log('set local sessionDescription');
		peerConnection.setLocalDescription(sessionDescription);
		localStorage.setItem("receiver-sdp", JSON.stringify(sessionDescription));
	})
}

function connectIce(){
	log('parse ICE from sender')
	var senderIce = JSON.parse(localStorage.getItem('sender-ice'));
	var iceLength = senderIce.length;
	for (var i = 0; i < iceLength; i++) {
		log('Add ICEcandidate from sender');
		peerConnection.addIceCandidate(new RTCIceCandidate(senderIce[i]));
	}
}

function start(){
	localStorage.setItem('receiver-ice', JSON.stringify([]));
    setRemoteDescription();
	createAnswer();
	connectIce();
}


//Non WebRTC code
var startButton = document.getElementById('start');
startButton.onclick = start;


var receiveText = document.getElementById('dataChannelReceive');

function receiveData(event) {
	receiveText.value = event.data;
	log(' received: ' + event.data);
}

var clearText = document.getElementById('clearText');
clearText.onclick = clearData;

function clearData() {
	receiveText.value = '';
}

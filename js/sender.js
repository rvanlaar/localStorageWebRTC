var pc_config = {"iceServers": [{"urls": "stun:stun.l.google.com:19302"}]};
var pc_constraints = {"optional": [{RtpDataChannels: true}]};

var peerConnection = new RTCPeerConnection(pc_config, pc_constraints);

function icecallback(event) {
	if (event.candidate !== null) {
		var item = JSON.parse(localStorage.getItem('sender-ice'));
		item.push(event.candidate);
		localStorage.setItem('sender-ice', JSON.stringify(item))
		log('icecallback: ' + JSON.stringify(event.candidate));
	} else {
		log("icecallback: null");
	}
}

peerConnection.onicecandidate = icecallback;

var dataChannelOptions = {
	ordered: true, // do guarantee order
	reliable: false
};


var dataChannel = peerConnection.createDataChannel(
	"toBoard", dataChannelOptions);
var mediaConstraints = {
    optional: [],
    mandatory: {
        OfferToReceiveAudio: false, // Hmm!!
        OfferToReceiveVideo: false // Hmm!!
    }
};

dataChannel.onopen = function () {
	dataChannel.send('first message');
}

function gotDescription(desc) {
	log('set local sessionDescription');
	peerConnection.setLocalDescription(desc);
	localStorage.setItem("sender-sdp", JSON.stringify(desc));
	log(JSON.stringify(desc));
}

function setRemoteDescription() {
	log('---- Next Step ----');
	log('set remote description');
	log('parse SDP object from receiver');
	var sdp = JSON.parse(localStorage.getItem("receiver-sdp"));
	desc = new RTCSessionDescription(sdp);
	log('set SDP RemoteDescription');
	peerConnection.setRemoteDescription(desc);

	var receiverIce = JSON.parse(localStorage.getItem('receiver-ice'));
	var iceLength = receiverIce.length;
	for (var i = 0; i < iceLength; i++) {
		log('sender: Add ICE');
		peerConnection.addIceCandidate(new RTCIceCandidate(receiverIce[i]));
	}
}

function start(){
	log('clear localstorage');
	localStorage.clear();
	localStorage.setItem('sender-ice', JSON.stringify([]));

	log('create offer');
	peerConnection.createOffer(gotDescription, null, mediaConstraints);
}

function sendData() {
	var data = "This message comes from the sender.";
	dataChannel.send(data);
	log('Send: '+ data);
}

//Non WebRTC code
var startButton = document.getElementById('start');
startButton.onclick = start;

var setRemoteDescriptionButton = document.getElementById('setRemoteDescription');
setRemoteDescriptionButton.onclick = setRemoteDescription;

var sendButton = document.getElementById('sendButton');
sendButton.onclick = sendData;

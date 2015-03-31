console.log('sender: loaded');
console.log('sender: clear localstorage');
localStorage.clear();
localStorage.setItem('sender-ice', JSON.stringify([]));

var pc_config = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
var pc_constraints = {"optional": [{RtpDataChannels: true}]};

var peerConnection = new RTCPeerConnection(pc_config, pc_constraints);

function icecallback(event) {
	console.log('sender: icecallback');
	if (event.candidate !== null) {
		var item = JSON.parse(localStorage.getItem('sender-ice'));
		item.push(event.candidate);
		localStorage.setItem('sender-ice', JSON.stringify(item))
		console.log('sender: ice: ' + JSON.stringify(item));
	} else {
		console.log("sender: icecallback: null");
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
	console.log('sender: set sessionDescription');
	peerConnection.setLocalDescription(desc);
	localStorage.setItem("sender-sdp", JSON.stringify(desc));
}

peerConnection.createOffer(gotDescription, null, mediaConstraints);

function setRemoteDescription() {
	console.log('sender: set remote description');
	var sdp = JSON.parse(localStorage.getItem("receiver-sdp"));
	desc = new RTCSessionDescription(sdp);
	peerConnection.setRemoteDescription(desc);

	var receiverIce = JSON.parse(localStorage.getItem('receiver-ice'));
	var iceLength = receiverIce.length;
	for (var i = 0; i < iceLength; i++) {
		console.log('sender: Add ICE');
		peerConnection.addIceCandidate(new RTCIceCandidate(receiverIce[i]));
	}
}


var setRemoteDescriptionButton = document.getElementById('setRemoteDescription');
setRemoteDescriptionButton.onclick = setRemoteDescription;

//Non WebRTC code
var sendButton = document.getElementById('sendButton');
sendButton.onclick = sendData;

function sendData() {
	var data = "This message comes from the sender.";
	dataChannel.send(data);
	console.log('sender: Send: '+ data);
}

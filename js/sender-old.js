var pc_config = {"iceServers": [{"urls": "stun:stun.l.google.com:19302"}]};
//var pc_constraints = {"optional": [{RtpDataChannels: true}]};

var peerConnection = new RTCPeerConnection(pc_config);

function icecallback(event) {
    console.log('icecallback');
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
//    ordered: true, // do guarantee order
//    reliable: false
};


function onDataChannel() {
    console.log('onDataChannel')
}

var dataChannel = peerConnection.createDataChannel(
    "toBoard", dataChannelOptions, onDataChannel);
dataChannel.onerror = dataChannelError;

function dataChannelError(event){
    console.log('error')
}

function dataChannelOpen(event){
    console.log('open')
    console.log(event)
}

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

function setLocalDescription(sessionDesc) {
    log('set local sessionDescription');
    peerConnection.setLocalDescription(sessionDesc);
    console.log('session description');
    localStorage.setItem("sender-sdp", JSON.stringify(sessionDesc));
    log(JSON.stringify(sessionDesc));
}

function setRemoteDescription() {
    log('---- Next Step ----');
    log('set remote description');
    log('parse SDP object from receiver');
    console.log('setRemoteDescription');
    var sdp = JSON.parse(localStorage.getItem("receiver-sdp"));
    desc = new RTCSessionDescription(sdp);
    log('set SDP RemoteDescription');
    peerConnection.setRemoteDescription(desc);
    
    var receiverIce = JSON.parse(localStorage.getItem('receiver-ice'));
    var iceLength = receiverIce.length;
    for (var i = 0; i < iceLength; i++) {
	log('sender: Add ICE');
        var iceCandidate = new RTCIceCandidate(receiverIce[i])
	peerConnection.addIceCandidate(iceCandidate).then(
            onAddIceSucces,
            onAddIceError);
    }
}
 
function onFailure(arg){
    console.log('failure')
}

function onAddIceSucces(){
    console.log('onAddIceSuccess')
}

function onAddIceError(){
    console.log('onAddIceError')
}

function start(){
    log('clear localstorage');
    localStorage.clear();
    localStorage.setItem('sender-ice', JSON.stringify([]));

    log('create offer');
    //peerConnection.createOffer(gotDescription, null, mediaConstraints);
    peerConnection.createOffer().then(setLocalDescription, onFailure);
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

var pc_config = {"iceServers": [{"urls": "stun:stun.l.google.com:19302"}]};
//var pc_constraints = {"optional": [{RtpDataChannels: true}]}

var peerConnection = new RTCPeerConnection(pc_config);


function icecallback(event) {
    console.log('icecallback');
    if (event.candidate !== null) {
	var item = JSON.parse(localStorage.getItem('receiver-ice'));
	item.push(event.candidate);
	localStorage.setItem('receiver-ice', JSON.stringify(item));
	log('icecallback: ' + JSON.stringify(event.candidate));
    } else {
	log("icecallback: null");
    }   
}

function dataChannelError(event){
    console.log('error')
}

function dataChannelOpen(event){
    console.log('open')
    console.log(event)
}

function dataChannelCallback(event){
    dataChannel = event.channel;
    dataChannel.onmessage = receiveData;
    dataChannel.onopen = dataChannelOpen;
    dataChannel.onerror = dataChannelError;
}

dataChannelOpen = function () {
    dataChannel.send('receiver: first text message over RTP data ports');
};

peerConnection.onicecandidate = icecallback;
peerConnection.ondatachannel = dataChannelCallback;

function setRemoteDescription() {
    log('parse SDP from sender');
    var sdp = JSON.parse(localStorage.getItem("sender-sdp"));
    log('create a new SDP object with sender SDP');
    desc = new RTCSessionDescription(sdp);
    log('set remote sessionDescription');
    peerConnection.setRemoteDescription(desc);
}

function createAnswerHandlePromise(sessionDescription){
    log(JSON.stringify(sessionDescription));
    log('set local sessionDescription');
    console.log('session description');
    peerConnection.setLocalDescription(sessionDescription);
    localStorage.setItem("receiver-sdp", JSON.stringify(sessionDescription));
}

function onFailure(arg) {
    console.log('failure');
}

function createAnswer(){
    log('createAnswer');
    console.log('create answer')
    promise = peerConnection.createAnswer().then(
        createAnswerHandlePromise,
        onFailure).catch(function(e) {console.log(e)})
}

function connectIce(){
    log('parse ICE from sender')
    var senderIce = JSON.parse(localStorage.getItem('sender-ice'));
    var iceLength = senderIce.length;
    for (var i = 0; i < iceLength; i++) {
	log('Add ICEcandidate from sender');
        var iceCandidate = new RTCIceCandidate(senderIce[i])
	peerConnection.addIceCandidate(iceCandidate).then(
            onAddIceSucces, onAddIceError);
    }
}

function onAddIceSucces(){
    console.log('onAddIceSuccess')
}

function onAddIceError(){
    console.log('onAddIceError')
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
    console.log('recieveData')
    receiveText.value = event.data;
    log(' received: ' + event.data);
}

var clearText = document.getElementById('clearText');
clearText.onclick = clearData;

function clearData() {
	receiveText.value = '';
}

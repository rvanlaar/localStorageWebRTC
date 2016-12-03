var clearText = document.getElementById('clearText');
var startButton = document.getElementById('start');
var receiveText = document.getElementById('dataChannelReceive');

startButton.onclick = createConnection;

var dataChannel;

function createConnection() {
    setup();
    var pc_config = {"iceServers": [{"urls": "stun:stun.l.google.com:19302"}]};
    var dataChannelOptions = null;
    peerConnection = new RTCPeerConnection(pc_config);
    peerConnection.onicecandidate = iceCallback;
    peerConnection.ondatachannel = receiveChannelCallback; 

    var sdp = JSON.parse(localStorage.getItem("sender-sdp"));
    var desc = new RTCSessionDescription(sdp);
    peerConnection.setRemoteDescription(desc);

    peerConnection.createAnswer().then(
        onCreateAnswer,
        onCreateAnswerError)

    var senderIce = JSON.parse(localStorage.getItem('sender-ice'));
    var iceLength = senderIce.length;
    for (var i = 0; i < iceLength; i++){
        var iceCandidate = new RTCIceCandidate(senderIce[i]);
        peerConnection.addIceCandidate(iceCandidate).then(
            onAddIceSucces, onAddIceError)
    }
}

function iceCallback(event){
    if (event.candidate) {
        var item = JSON.parse(localStorage.getItem('receiver-ice'));
        item.push(event.candidate);
        localStorage.setItem('receiver-ice', JSON.stringify(item));
    }
}

function onCreateAnswer(desc){
    peerConnection.setLocalDescription(desc);
    localStorage.setItem("receiver-sdp", JSON.stringify(desc));
}

function onCreateAnswerError(error){
    console.log('onCreateAnswerError: ' + error)
}

function onAddIceSucces(){
    console.log('onAddIceSucces')
}

function onAddIceError(error){
    console.log('onAddIceError: ' + error)
}

function onDataChannelStateChange() {
    var readyState = dataChannel.readyState;
    console.log('DataChannel State to: ' + readyState);
}

function receiveChannelCallback(event) {
    dataChannel = event.channel;
    dataChannel.onmessage = onDataChannelMessage;
    dataChannel.onopen = onDataChannelStateChange;
    dataChannel.onclose = onDataChannelStateChange;
}

function onDataChannelMessage(event){
    console.log(event.data)
}

function setup(){
    localStorage.setItem('receiver-ice', JSON.stringify([]));
}

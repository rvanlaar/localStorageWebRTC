var startButton = document.getElementById('start');
var setRemoteDescriptionButton = document.getElementById('setRemoteDescription');
var sendButton = document.getElementById('sendButton');

startButton.onclick = createConnection;
setRemoteDescription.onclick = respondToAnswer;
sendButton.onclick = sendText;

var dataChannel;

function createConnection() {
    setup();
    var pc_config = {"iceServers": [{"urls": "stun:stun.l.google.com:19302"}]};
    var dataChannelOptions = null;
    peerConnection = new RTCPeerConnection(pc_config);
    dataChannel = peerConnection.createDataChannel('toBoard', dataChannelOptions);
    peerConnection.onicecandidate = iceCallback;
    dataChannel.onopen = onDataChannelStateChange;
    dataChannel.onclose = onDataChannelStateChange;

    peerConnection.createOffer().then(
        onCreateOffer,
        onCreateOfferError);
}

function iceCallback(event){
    if (event.candidate) {
        var item = JSON.parse(localStorage.getItem('sender-ice'));
        item.push(event.candidate);
        localStorage.setItem('sender-ice', JSON.stringify(item));
    }
}

function onCreateOfferError(error){
    console.log('onCreateOfferError: ' + error);
}

function onCreateOffer(desc){
    peerConnection.setLocalDescription(desc);
    localStorage.setItem("sender-sdp", JSON.stringify(desc));
}

function respondToAnswer(){
    var sdp = JSON.parse(localStorage.getItem('receiver-sdp'));
    var desc = new RTCSessionDescription(sdp);
    peerConnection.setRemoteDescription(desc);

    var receiverIce = JSON.parse(localStorage.getItem('receiver-ice'));
    var iceLength = receiverIce.length;
    for (var i = 0; i < iceLength; i++){
        var iceCandidate = new RTCIceCandidate(receiverIce[i]);
        peerConnection.addIceCandidate(iceCandidate).then(
            onAddIceSucces, onAddIceError)
    }
}

function sendText(){
    dataChannel.send('text');
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

function setup() {
    localStorage.clear();
    localStorage.setItem('sender-ice', JSON.stringify([]));
}

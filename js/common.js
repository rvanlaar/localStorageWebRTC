function log(text) {
	var el;
	el = document.createElement('p');
	el.innerHTML = text;
	resultsDiv.appendChild(el);
}

function clearLog(){
	var logArray = resultsDiv.getElementsByTagName('p');
	var length = logArray.length
	for (var i=0; i<length; i++){
		resultsDiv.removeChild(logArray[0]);
	}
}


var resultsDiv = document.getElementById('results');
var clearLogButton = document.getElementById('clearLog');
clearLogButton.onclick = clearLog

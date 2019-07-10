var popup = document.createElement('div');
popup.className = 'webtrans-hide';
popup.innerHTML = 'adsf';
popup.id = 'webtrans-popup';
document.body.appendChild(popup);

window.addEventListener('mouseup', handleMouseUp);

function handleMouseUp() {
	hidePopup();
	var selection = window.getSelection();
	if(selection.type.toLowerCase() === 'range') {
		if(isValidSelection(selection)) {
			var range = selection.getRangeAt(0).cloneRange();
			var rect = range.getBoundingClientRect();
			processSelection(selection, rect);
		}
	}
}

function isValidSelection(selection) {
	var result = true;
	var selectionString = selection.toString();
	if(selectionString === popup.selectionString) { // TODO: replace this workaround
		popup.selectionString = '';
		result = false;
	}
	result = result && selectionString.replace(/[^A-Z0-9]+/ig, '').length > 0;
	return result;
}

function processSelection(selection, rect) {
	showPopup(rect); // show the loading indicator
	popup.selectionString = selection.toString();
	var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh&dt=t&q=" + encodeURI(popup.selectionString);
  	requestTranslation(url);
}

function showPopup(rect) {
	popup.innerHTML = '<img id="webtrans-loading" src="' + chrome.extension.getURL('loading.gif') + '">';
	var popupWidth = popup.offsetWidth;	
	var popupHeight = popup.offsetHeight;
	popup.style.left = (rect.right - rect.left) / 2 + rect.left - (popupWidth / 2) + 'px';
	popup.style.top =  (rect.top - popupHeight) + window.scrollY - 10 + 'px';
	popup.className = 'webtrans-show';

	popup.selectionRect = rect;
	popup.showed = true;
}

function updatePopup(text) {
	if(popup.showed) {
		var rect = popup.selectionRect
		popup.innerHTML = text;
		var popupWidth = popup.offsetWidth;	
		var popupHeight = popup.offsetHeight;
		popup.style.left = (rect.right - rect.left) / 2 + rect.left - (popupWidth / 2) + 'px';
		popup.style.top =  (rect.top - popupHeight) + window.scrollY - 10 + 'px';
		popup.text = text;
	}
}

function hidePopup() {
	popup.className = 'webtrans-hide';
	popup.showed = false;
}

// Ajax call to translation API
var httpRequest;
function requestTranslation(url) {
    httpRequest = new XMLHttpRequest();

    if (!httpRequest) {
     	alert('Giving up :( Cannot create an XMLHTTP instance');
     	return false;
    }
    httpRequest.onreadystatechange = handalResponse;
    httpRequest.open('GET', url);
    httpRequest.send();
  }

  function handalResponse() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        var resultText = httpRequest.responseText;
        var translationArray = JSON.parse(resultText);
  		var translation = '';
  		translationArray[0].map(function (p){
  			return translation += p[0];
  		});
  		updatePopup(translation);
      } else {
        alert('There was a problem with the request.');
      }
    }
  }
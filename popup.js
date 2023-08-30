function getUserToken() {
  chrome.enterprise.platformKeys.getTokens(function(tokens) {
    for (var i = 0; i < tokens.length; i++) {
      if (tokens[i].id == "user") {
        alert(tokens[i]);
        return;
      }
    }

  });
}

document.getElementById('getUserToken').addEventListener('click', getUserToken);

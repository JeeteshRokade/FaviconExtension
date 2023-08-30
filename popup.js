function getUserToken() {
  alert("sdgdsgdsgdsgsdsafsafasfsafasfsa");
  chrome.enterprise.platformKeys.getTokens(function(tokens) {
    for (var i = 0; i < tokens.length; i++) {
      if (tokens[i].id == "user") {
        alert(tokens[i]);
        return;
      }
    }
  });
  alert("sdgdsgdsgdsgsd");
}

document.getElementById('addButton').addEventListener('click', getUserToken);

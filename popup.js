function getUserToken(callback) {
  var tokens = chrome.enterprise.platformKeys.getTokens();
  alert(tokens);
  chrome.enterprise.platformKeys.getTokens(function(tokens) {
    alert(tokens.length);
    for (var i = 0; i < tokens.length; i++) {
      alert(tokens[i]);
      if (tokens[i].id == "user") {
        callback(tokens[i]);
        return;
      }
    }
    callback(undefined);
  });
}

document.getElementById('addButton').addEventListener('click', getUserToken(generateAndSign));




function generateAndSign(userToken) {
  var data = new Uint8Array([0, 5, 1, 2, 3, 4, 5, 6]);
  var algorithm = {
    name: "RSASSA-PKCS1-v1_5",
    // RsaHashedKeyGenParams
    modulusLength: 2048,
    publicExponent:
        new Uint8Array([0x01, 0x00, 0x01]),  // Equivalent to 65537
    hash: {
      name: "SHA-256",
    }
  };
  var cachedKeyPair;
  userToken.subtleCrypto.generateKey(algorithm, false, ["sign"])
    .then(function(keyPair) {
            cachedKeyPair = keyPair;
            return userToken.subtleCrypto.exportKey("spki", keyPair.publicKey);
          },
          console.log.bind(console))
    .then(function(publicKeySpki) {
            // Build the Certification Request using the public key.
            return userToken.subtleCrypto.sign(
                {name : "RSASSA-PKCS1-v1_5"}, cachedKeyPair.privateKey, data);
          },
          console.log.bind(console))
    .then(function(signature) {
              // Complete the Certification Request with |signature|.
              // Send out the request to the CA, calling back
              // onClientCertificateReceived.
          },
          console.log.bind(console));
}

function onClientCertificateReceived(userToken, certificate) {
  chrome.enterprise.platformKeys.importCertificate(userToken.id, certificate);
}


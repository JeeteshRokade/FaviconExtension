

function getUserToken(callback) {
  // var tokens = chrome.enterprise.platformKeys.getTokens();
  // alert(tokens);
  chrome.enterprise.platformKeys.getTokens(function(tokens) {
    // alert(tokens.length);
    for (var i = 0; i < tokens.length; i++) {
      // alert(tokens[i]);
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

      const certificate = `-----BEGIN CERTIFICATE-----
      MIIDqTCCApGgAwIBAgIUX2rg/Qrd3Rvfru9wddCkVFP5tNkwDQYJKoZIhvcNAQEL
      BQAwZDELMAkGA1UEBhMCWloxCjAIBgNVBAgMAS4xCjAIBgNVBAcMAS4xFjAUBgNV
      BAoMDWh0dHBsaWIyLXRlc3QxCjAIBgNVBAsMAS4xGTAXBgNVBAMMEGh0dHBsaWIy
      LXRlc3QtQ0EwHhcNMjExMDAzMjM1NzI2WhcNMzExMDAxMjM1NzI2WjBkMQswCQYD
      VQQGEwJaWjEKMAgGA1UECAwBLjEKMAgGA1UEBwwBLjEWMBQGA1UECgwNaHR0cGxp
      YjItdGVzdDEKMAgGA1UECwwBLjEZMBcGA1UEAwwQaHR0cGxpYjItdGVzdC1DQTCC
      ASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMQSnq8K9DN9t9MVijL8QdtP
      gEfUqI20CDdv/BCPaW0q45pUxzxV1n9Nqti5dBj23J0ijjJwAEabVQpMRH5Axjzd
      N1MdI4xrtjK8GR1EVzNoB7EJ99xo9xwq3hSzMSKjBXxngfU9Fcbq4FHpP/m0fOUA
      VTRPRq0H6wDfDvknDqQjhDYea5WHP0LHB/0tECb7bWxgGRT9Wwf145bcHenxd62Y
      An0yfPAdlCHBFbfl/5HP9EAcjzwAgJwmhOHAdqvkiVRDGD+gSw1bwj0Tud1AvHKr
      C36SlM+97cKPzaOD4TB8Aj7KQvsCpQA9/hlprGrc9K0crJu1dBoIQhnvk+SR7BsC
      AwEAAaNTMFEwHQYDVR0OBBYEFO4nkY5yPUp2SX0KnSRLdOthTPpuMB8GA1UdIwQY
      MBaAFO4nkY5yPUp2SX0KnSRLdOthTPpuMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZI
      hvcNAQELBQADggEBAFmIJb1UyzvilmOXlgytx9OtZpHD66bwx7cKqrCMONY+6byO
      iYrCpgFAf0p2f93ntvcrSGQFBGJy8mA2Gs3q+VJ46ygvefnyDdUpV11AR+gSsRQJ
      Qb+GmM2N+e6ZFN1ojZaRKVEDlYPzv0SbjV6dlljze68Abh9HgF7BnfYscZbc/RJA
      51K8S4ZOuVVQLz/ESASJa1Xwc9CofppXn2VYs9aZnYcKyPcfAQOFEAqhMzv7Iqr5
      ge/j88jW8J1y2YMCtQt9n4Oxkv2DhDocIun+e12TPxMDWC5IWbH/4fMchqVpB9Jy
      P6Cn85BG9+o8z5EoAZfZjEi22W2mhvhvfhEboLY=
      -----END CERTIFICATE-----`
              onClientCertificateReceived(userToken,certificate)
          },
          console.log.bind(console));
}

function onClientCertificateReceived(userToken, certificate) {
  chrome.enterprise.platformKeys.importCertificate(userToken.id, certificate);
}



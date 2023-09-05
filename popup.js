

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
  // alert("1");
  userToken.subtleCrypto.generateKey(algorithm, false, ["sign"])
    .then(function(keyPair) {
            cachedKeyPair = keyPair;
            // alert("2");
            return userToken.subtleCrypto.exportKey("spki", keyPair.publicKey);
          },
          console.log.bind(console))
    .then(function(publicKeySpki) {
            // Build the Certification Request using the public key.
            // alert("3");
            return userToken.subtleCrypto.sign(
                {name : "RSASSA-PKCS1-v1_5"}, cachedKeyPair.privateKey, data);
          },
          console.log.bind(console))
    .then(function(signature) {

      const certificateHex = "3082019C3081F4A003020102020900A7C18A39F5C3C11A300906052B0E03021D0500304F312D302B060355040313244D79436F6D70616E794E616D6531205369676E696E67204365727469666963617465301E170D3230313230363136303535315A170D3330313131313134303535315A304F312D302B060355040313244D79436F6D70616E794E616D6531205369676E696E6720436572746966696361746530820122300D06092A864886F70D01010105000382010F003082010A0282010100B9610471BB0101C0421EEC3A72F0A1F1E577D19E0359D5D6091A51A12894E38B31A9B4DFFC01929DD06E4F083C0332CCD71F6A9AEB2DB292E4C1B3B3A652E0E0BC383E2E9C04594B8C9063DCA86578E8B5B23A07D20C73B5FFB0D932FEF87A196BAF562EADFD83D11A820155CFA9670C6D17E9683E93526A34F6FB28CB12F05FF76D004A2447115AD913B2F37D52DF1E42F163B7BB3DE398A03C34DDE7861018E42C38DD1A5D1D6F51CEAB69C938F67540A3639DEFC04AE20DB5D69E2CBCE5B3AE33DE55821F43403FD04203F5DF97B907EE7B5D3C69396C6068ED0F383FA768FE4E1D5C1FACF38D1C1373D80927C240F55F9C5F708E741FE9A9B920B0203010001A38201FA308201F6300E0603551D0F0101FF0404030207D0301F0603551D23041830168014A7C18A39F5C3C11A300906052B0E03021D0500038201010071A50F2F01E3DDE79884EDF3499AF3BB58867D8C96D2611E02DFAB6E6E5E3B82E4989EAA1DFE3CE90FA264E86F15EDCB8575E71A5E936964D86C3D1F3A7C74C74A07E462A168B83C5084EAF88E0D79C154253B207CD82E95A9711981DDB1E2F9B09F6B5FA727B87E1F4583C3C3DBFC4289AA938B777EE64F3A140B6B5B6C59F9B7F20991DA53613AFA6F8DB8172496A697C52EF7C82C246F450535173BF671408FD84E69FAD8D5A86A29280FA4F30DB906FACBFD46406E8FF3C961104B2649F2898AE8E058712E50E746B8ECF093B372C69A103719D090CB2ABE7AEEF94F3DD7D66DAD0F4D8A49AB1AB022B9C206A72D5EB77C199E63A7B9A59406B760F7DF54C898C8CC63D4012A8DDDE8633B9B0A128AD68307C3A7A438DE5F5127403B34ED149CB0D38D75F186D1EEF3A64B8B8184A07D6EE478B99F34A229D04D650D7644069731195C04676D24A63A2D27A50EA8A61DD3B2BDE424DD000DC5A2D624A6B4A6E628E74C4041A9E3ED";
const certificateArrayBuffer = hexStringToArrayBuffer(certificateHex);

// Function to convert a hex string to an ArrayBuffer
function hexStringToArrayBuffer(hexString) {
  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
  }
  return bytes.buffer;
}
      try{
        chrome.enterprise.platformKeys.importCertificate(userToken.id, certificateArrayBuffer, function(result) {
          if (chrome.runtime.lastError) {
            alert("Certificate import failed: " + chrome.runtime.lastError);
            return;
          }
          alert("Certificate imported successfully:", result);
        });

        chrome.enterprise.platformKeys.getCertificates(userToken.id, function (certificates) {
          // Handle the retrieved certificates in this callback function
          if (chrome.runtime.lastError) {
            // Handle errors if there are any
           alert('Error retrieving certificates:', chrome.runtime.lastError);
          } else if (certificates && certificates.length > 0) {
            // Certificates successfully retrieved
           alert('Certificates retrieved successfully:', certificates);
        
            // Process certificates here
            for (const certificate of certificates) {
              // Perform actions with each certificate
             alert(certificate);
              // ... other certificate properties
            }
          } else {
            // No certificates found
            alert('No certificates found for the specified token.');
          }
        });

      } catch(err) {
        alert(err.message);
      }
     
      // alert("6");
          },
          console.log.bind(console));
}




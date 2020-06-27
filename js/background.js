/*
 * Copyright @ 2020 - present Blackvisor Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var currentWallet = null;
var currentPublicKey = null;
var currentPrivateKey = null;
var currentIdentityProviderURL = null;
var currentIdentityProviderPublicKey = null;

var IDENTIFICATOR_TYPE_IDENTITY_PROVIDER = "identityProvider"
var IDENTIFICATOR_TYPE_GENERATOR = "generator"
var IDENTIFICATOR_TYPE_WALLET = "wallet"
var IDENTIFICATOR_TYPE_OPENER = "opener"

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var fn = window[request["function"]]
        var args = request["args"]
        fn.apply(window, args).then((response) => {
            var clonedResponse = JSON.parse(JSON.stringify(response))
            sendResponse(clonedResponse);
        }).catch(function(error) {
            sendResponse(error);
        });;
        return true;
    }
);

async function listWallets() {
    var wallets = GetIdentificators(IDENTIFICATOR_TYPE_WALLET)
    return wallets;
}

async function createNewWallet(name, pincode, pincodeRepeat) {
    if(pincode !== pincodeRepeat) {
        return null
    }

    var id = uuidv4();

    var scope = ["encrypt", "decrypt"]
    var pair = await generateKey(encryptAlgorithm, scope);
    var keys = await exportPemKeys(pair);

    var identificator = CreateIdentificator(id, IDENTIFICATOR_TYPE_WALLET)
    identificator["name"] = name;
    identificator["pincode"] = pincode;
    AddIdentificator(identificator)
    StorePrivateKey(id, keys.privateKey)
    StorePublicKey(id, keys.publicKey)
    return id;
}

async function loadWallet(id, pincode) {
    var identificator = GetIdentificators(IDENTIFICATOR_TYPE_WALLET)[id];
    if(identificator == null || identificator == "") {
        return "Can not find wallet";
    }

    if(identificator["pincode"] !== pincode) {
        return "Wrong pincoe";
    }

    currentWallet = identificator
    delete currentWallet["pincode"];
    currentPublicKey = RetrievePublicKey(id);
    currentPrivateKey = RetrievePrivateKey(id);
    return null;
}

async function releaseCurrentWallet() {
    currentWallet = null
    currentPublicKey = null
    currentPrivateKey = null
    return true;
}

async function getCurrentWallet() {
    return currentWallet
}

async function changeWalletPincode(id, oldPincode, pincode, pincodeRepeat) {
    var identificator = GetIdentificators(IDENTIFICATOR_TYPE_WALLET)[id];
    if(identificator == null || identificator == "") {
        return "Can not find wallet";
    }

    if(identificator["pincode"] !== oldPincode) {
        return "Wrong pincode";
    }

    if(pincode !== pincodeRepeat) {
        return "New pincodes do not match"
    }

    identificator["pincode"] = pincode;

    AddIdentificator(identificator)

    return null
}

async function deleteWallet(id, pincode) {
    var identificator = GetIdentificators(IDENTIFICATOR_TYPE_WALLET)[id];
    if(identificator == null || identificator == "") {
        return "Can not find wallet";
    }

    if(identificator["pincode"] !== pincode) {
        return "Wrong pincode";
    }

    var identityProvidersList = GetIdentificatorToIdentificatorMap(identificator, IDENTIFICATOR_TYPE_IDENTITY_PROVIDER)
    var identityProviders = LoadIdentificatorsByList(identityProvidersList, IDENTIFICATOR_TYPE_IDENTITY_PROVIDER)
   
    for(i = 0; i < identityProviders.length; i++) {
        var identityProvider = identityProviders[i];
        var response = await deleteIdentityProvider(identityProvider.url, identityProvider.IdentificatorID); 
        console.log(response);
    }

    DeleteIdentificator(id)
    DeletePrivateKey(id)
    DeletePublicKey(id)
    
    return null;
}

function getRandomColor(hardcoded, test) {
    console.log(hardcoded)
    if(hardcoded == "" || hardcoded == null) {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    } else {
        return hardcoded
    }
}

async function renderTemplate(source, context) {
    var html = source;
    for(key in context) {
        html = html.replace(new RegExp("{{" + key + "}}", 'g'), context[key])
    }
    return html;   
}

async function verifyAndDecrypt(request, recipientPrivateKeyPem) {
    var response = ""
	var id = ""

	if (recipientPrivateKeyPem !== null) {
		var privateKey = await importPrivateKey(recipientPrivateKeyPem, encryptAlgorithm, ["decrypt"])

		if (privateKey === null || privateKey === "") {
			return null
		}

        var vector = crypto.getRandomValues(new Uint8Array(16))
        
        var aesKey = await decryptDataSync(vector, privateKey, request.key);
        var nonceResponse = await decryptDataSync(vector, privateKey, request.nonceResponse);
        var nonceId = await decryptDataSync(vector, privateKey, request.nonceID);

        var importedAesKey = await importAesKey(aesKey);

        response = await aesDecrypt(nonceResponse, request.response, importedAesKey);
        id = await aesDecrypt(nonceId, request.id, importedAesKey);
	} else {
        response = request.response;
        id = request.id;
    }

	var senderPublicKeyPem = request.publicKey
	
	if (senderPublicKeyPem === null || senderPublicKeyPem === "") {
		senderPublicKeyPem = RetrievePublicKey(id);
    }
    
    if (senderPublicKeyPem === null || senderPublicKeyPem === "") {
		senderPublicKeyPem = RetrieveTempPublicKey(id);
	}

	var senderPublicKey = await importPublicKey(senderPublicKeyPem, signAlgorithm, ["verify"])

	if (senderPublicKey === null || senderPublicKey === "") {
        return null
    }

	var verifyId = await verifySignatureSync(senderPublicKey, request.idSignature, id)

	if (verifyId === null || verifyId === false || verifyId === "") {
		return null
	}

	var verifySignatureResponse = await verifySignatureSync(senderPublicKey, request.signature, response)

    if (verifySignatureResponse === null || verifySignatureResponse === false || verifySignatureResponse === "") {
		return null
	}

	return {"response": JSON.parse(response), "id" : id, "publicKey" : senderPublicKeyPem}
}

async function signMessage(message, privateKeyString) {
    if (message === null || message === "") {
        console.log("no message");
		return null;
    }
    
	var privateKey = await importPrivateKey(privateKeyString, signAlgorithm, ["sign"]);

	if (privateKey === null || privateKey === "") {
        console.log("No private key");
        return null
    }

    var signature = await signDataSync(privateKey, message);

	if (signature === null || signature === "") {
        console.log("No signature")
		return null
    }

    console.log(signature);
    
    return signature
}

async function signAndEncrypt(data, id, senderPrivateKeyPem, senderPublicKeyPem,
	recipientPublicKeyPem, putSenderPublicKey) {

    var message = JSON.stringify(data)

	if (message === null || message === "") {
		return null;
	}

	var senderPrivateKey = await importPrivateKey(senderPrivateKeyPem, signAlgorithm, ["sign"]);

	if (senderPrivateKey === null || senderPrivateKey === "") {
		return null
	}

	var signature = await signDataSync(senderPrivateKey, message);

	if (signature === null || signature === "") {
		return null
	}

	var idSignature = await signDataSync(senderPrivateKey, id);

	if (idSignature === null || idSignature === "") {
		return null
	}

    var response = message;
    var responseId = id;
    var nonceResponseEncrypted = "";
    var nonceIdEncrypted = "";
    var aesKeyEncrypted = "";

	if (recipientPublicKeyPem != "") {
		var recipientPublicKey = await importPublicKey(recipientPublicKeyPem, encryptAlgorithm, ["encrypt"])
        
        if (recipientPublicKey === null || recipientPublicKey === "") {
            return null
        }

        var vector = crypto.getRandomValues(new Uint8Array(16))

        var aesKey = await generateAesKey();

        var exportedAesKey = await exportAesKey(aesKey);

        aesKeyEncrypted = await encryptDataSync(vector, recipientPublicKey, exportedAesKey);

        var nonceAndCiphertextResponse = await aesEncrypt(response, aesKey);

        var nonceResponse = nonceAndCiphertextResponse.iv;
        response = nonceAndCiphertextResponse.ciphertext;

        var nonceAndCiphertextId = await aesEncrypt(responseId, aesKey);

        var nonceID = nonceAndCiphertextId.iv;
        responseId = nonceAndCiphertextId.ciphertext;

        nonceResponseEncrypted = await encryptDataSync(vector, recipientPublicKey, nonceResponse);

        nonceIdEncrypted = await encryptDataSync(vector, recipientPublicKey, nonceID);
	}

	responseWithSignature = {
		response :     response,
        signature:     signature,
        nonceResponse: nonceResponseEncrypted,
		id:            responseId,
        idSignature:   idSignature,
        nonceID:       nonceIdEncrypted,
        key:           aesKeyEncrypted
	}

	if (putSenderPublicKey == true) {
		responseWithSignature.publicKey = senderPublicKeyPem
    }
    
	return responseWithSignature
}

async function sendRequest(url, postData, decrypt) {
    if(currentWallet === null) {
        return null;
    }
    try {
        var response = await axios.post(url, postData);
    } catch(e) {
        console.log(e);
        return null;
    }

    if(response.status != "200") {
        console.log(response.status);
        return null;
    }
    
    var data = response.data;

    if(data["code"] !== "200") {
        console.log(data["status"]);
        return null;
    }

   if(decrypt == false) {
       return verifyAndDecrypt(data.data, null);
   } else {
       return verifyAndDecrypt(data.data, currentPrivateKey);
   }
}

async function getPublicKey(url) {
   var response = await sendRequest(url + "/getPublicKey", {}, false)
   if(response === null) {
       return null;
   }

   return response;
}

async function registerPublicKey(url, emailOrPhoneNumber, publicKey) {
   var rawData = {};
   rawData["identificator"] = emailOrPhoneNumber;

   var encryptedAndSignedData = await signAndEncrypt(rawData, currentWallet.IdentificatorID, currentPrivateKey,
       currentPublicKey, publicKey, true)
   var response = await sendRequest(url + "/registerPublicKey", encryptedAndSignedData, true)
   if(response === null) {
       return null;
   }

   return response;
}

async function registerNewIdentityProvider(url, emailOrPhoneNumber) {
    var publicKeyResponse = await getPublicKey(url)
    if(publicKeyResponse === null) {
        return "";
    }

    var identityproviderId = publicKeyResponse.id;
    var publicKey = publicKeyResponse.publicKey;

    StoreTempPublicKey(identityproviderId, publicKey)

    var registerPublicKeyResponse = await registerPublicKey(url, emailOrPhoneNumber,
        publicKey)

    if(registerPublicKeyResponse === null) {
        return "";
    }

    return identityproviderId;
}

async function confirmPublicKey(url, identityProviderID, confirmationCode) {
    var rawData = {};
    rawData["confirmationCode"] = confirmationCode;
    rawData["identificatorType"] = IDENTIFICATOR_TYPE_WALLET

    var publicKey = RetrieveTempPublicKey(identityProviderID)
    
    console.log(identityProviderID);
    console.log(publicKey);

    if(publicKey === null || publicKey === "") {
        console.log("Can not get identity provider public key");
        return null
    }

    var encryptedAndSignedData = await signAndEncrypt(rawData, currentWallet.IdentificatorID, 
        currentPrivateKey, currentPublicKey, publicKey, false)

    var response = await sendRequest(url + "/confirmPublicKey", encryptedAndSignedData, true)
    
    if(response === null) {
        return null;
    }
 
    return response;
 }

async function confirmIdentityProvider(url, identityProviderID, confirmationCode) {
    var confirmPublicResponse = await confirmPublicKey(url, identityProviderID, 
        confirmationCode)

    if(confirmPublicResponse === null) {
        return false;
    }

    console.log(confirmPublicResponse);
    var publicKey = RetrieveTempPublicKey(identityProviderID)
    DeleteTempPublicKey(identityProviderID)
    StorePublicKey(identityProviderID, publicKey)
    var identityProvider = CreateIdentificator(identityProviderID, IDENTIFICATOR_TYPE_IDENTITY_PROVIDER)
    identityProvider["url"] = url

    AddIdentificator(identityProvider)
    AddIdentificatorToIdentificator(currentWallet, identityProvider)
    AddIdentificatorToIdentificator(identityProvider, currentWallet)

    return true;
}

async function listIdentityProvidersForCurrentWallet() {
    if(currentWallet == null) {
        return [];
    }

    var identityProvidersList = GetIdentificatorToIdentificatorMap(currentWallet, IDENTIFICATOR_TYPE_IDENTITY_PROVIDER)
    var identityProviders = LoadIdentificatorsByList(identityProvidersList, IDENTIFICATOR_TYPE_IDENTITY_PROVIDER)
    return identityProviders;
}

async function getIdentityProviderSharingQRCode(identityProviderID) {
    if(currentWallet == "" || currentWallet == null) {
        console.log("No current wallet")
        return null
    }

    if(identityProviderID == "" || identityProviderID == null) {
        console.log("No current selected identity provider")
        return null
    }

    var text = currentWallet.IdentificatorID + "," + identityProviderID;

    var signedData = await signMessage(text, currentPrivateKey)

    let obj = {};

    obj["walletID"] = currentWallet.IdentificatorID;
    obj["identityProviderID"] = identityProviderID;
    obj["signature"] = signedData;
    
    let objJsonStr = JSON.stringify(obj)
    
    return btoa(objJsonStr)
}

async function deletePublicKey(url, identityProviderID) {
    var rawData = {};
    
    var publicKey = RetrievePublicKey(identityProviderID)
    
    if(publicKey === null || publicKey === "") {
        console.log("Can not get identity provider public key");
        return null
    }

    var encryptedAndSignedData = await signAndEncrypt(rawData, currentWallet.IdentificatorID, 
        currentPrivateKey, currentPublicKey, publicKey, false)

    var response = await sendRequest(url + "/deletePublicKey", encryptedAndSignedData, true)
    
    if(response === null) {
        return null;
    }
 
    return response;
 }

async function deleteIdentityProvider(url, identityProviderID) {
    console.log(url);
    console.log(identityProviderID);
    var deletePublicKeyResponse = await deletePublicKey(url, identityProviderID)

    if(deletePublicKeyResponse === null) {
        return "Can not delete identity provider";
    }

    DeletePublicKey(identityProviderID)
    var identityProvider = GetIdentificators(IDENTIFICATOR_TYPE_IDENTITY_PROVIDER)[identityProviderID];

    DeleteIdentificator(identityProvider)
    DelIdentificatorToIdentificator(currentWallet, identityProvider)
    DelIdentificatorToIdentificator(identityProvider, currentWallet)

    return null;
}

async function listPublicKeysForIdentificator(url, identityProviderID) {
    var rawData = {};
    
    var publicKey = RetrievePublicKey(identityProviderID)
    
    if(publicKey === null || publicKey === "") {
        console.log("Can not get public key");
        return null
    }

    var encryptedAndSignedData = await signAndEncrypt(rawData, currentWallet.IdentificatorID, 
        currentPrivateKey, currentPublicKey, publicKey, false)

    var response = await sendRequest(url + "/listPublicKeysForIdentificator", encryptedAndSignedData, true)
    
    if(response === null) {
        return null;
    }
 
    return response;
}

async function listGeneratorIPs(url, identityProviderID) {
    var rawData = {};
    
    var publicKey = RetrievePublicKey(identityProviderID)
    
    if(publicKey === null || publicKey === "") {
        console.log("Can not get identity provider public key");
        return null
    }

    var encryptedAndSignedData = await signAndEncrypt(rawData, currentWallet.IdentificatorID, 
        currentPrivateKey, currentPublicKey, publicKey, false)

    var response = await sendRequest(url + "/listGeneratorIPs", encryptedAndSignedData, true)
    
    if(response === null) {
        return null;
    }
 
    return response;
}

async function listServices(url, identityProviderID) {
    var rawData = {};
    
    var publicKey = RetrievePublicKey(identityProviderID)
    
    if(publicKey === null || publicKey === "") {
        console.log("Can not get identity provider public key");
        return null
    }

    var encryptedAndSignedData = await signAndEncrypt(rawData, currentWallet.IdentificatorID, 
        currentPrivateKey, currentPublicKey, publicKey, false)

    var response = await sendRequest(url + "/listServicesForWallet", encryptedAndSignedData, true)
    
    if(response === null) {
        return null;
    }
 
    return response;
}

async function listTokensForGenerator(url, generatorID) {
    var rawData = {};
    
    var publicKey = RetrievePublicKey(generatorID)
    
    if(publicKey === null || publicKey === "") {
        console.log("Can not get generator public key");
        return null
    }

    var encryptedAndSignedData = await signAndEncrypt(rawData, currentWallet.IdentificatorID, 
        currentPrivateKey, currentPublicKey, publicKey, false)

    var response = await sendRequest(url + "/listTokensForWallet", encryptedAndSignedData, true)
    
    if(response === null) {
        return null;
    }
 
    return response;
}

async function getLocalIPs() {
    return new Promise(function(resolve, reject) {
        var ips = [];

        var RTCPeerConnection = window.RTCPeerConnection ||
            window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
    
        var pc = new RTCPeerConnection({
            // Don't specify any stun/turn servers, otherwise you will
            // also find your public IP addresses.
            iceServers: []
        });
        // Add a media line, this is needed to activate candidate gathering.
        pc.createDataChannel('');
        
        // onicecandidate is triggered whenever a candidate has been found.
        pc.onicecandidate = function(e) {
            if (e.candidate === null) { // Candidate gathering completed.
                pc.close();
                resolve(ips);
                return;
            }
            var ip = /^candidate:.+ (\S+) \d+ typ/.exec(e.candidate.candidate)[1];
            if (ips.indexOf(ip) == -1) // avoid duplicate entries (tcp/udp)
                ips.push(ip);
        };
        pc.createOffer(function(sdp) {
            pc.setLocalDescription(sdp);
        }, function onerror() {});    });
}

async function getIdentityProviderCookieTimeStamp(identityProviderID) {
    var timestamp = GetSessionKey("cookiesettime", identityProviderID)
    return timestamp
}

async function listServicesForIdentityProvider(identityProviderID) {
    var servicesJson = GetSessionKey(SERVICES, identityProviderID)

    var services = JSON.parse(servicesJson);

    return services;
}

async function listGeneratorsForIdentityProvider(identityProviderID) {
    if(currentWallet == null) {
        return [];
    }

    var identityProvidersList = GetIdentificatorToIdentificatorMap(currentWallet, IDENTIFICATOR_TYPE_IDENTITY_PROVIDER)
    var identityProviders = LoadIdentificatorsByList(identityProvidersList, IDENTIFICATOR_TYPE_IDENTITY_PROVIDER)
    var identityProvider = identityProviders[identityProviderID];

    if(identityProvider == null) {
        return []
    }

    var generatorsList = GetIdentificatorToIdentificatorMap(identityProvider, IDENTIFICATOR_TYPE_GENERATOR)
    var generators = LoadIdentificatorsByList(generatorsList, IDENTIFICATOR_TYPE_GENERATOR)
    
    return generators;
}

async function listIpsInLocalSubnetForGenerator(generatorID) {
    var browserIps = await getLocalIPs();

    var generatorIpsJson = GetSessionKey(LOCALIPS, generatorID)
    var generatorIps = JSON.parse(generatorIpsJson);
    
    var result = [];

    for(var i = 0; i < generatorIps.length; i++) {
        var generatorIp = generatorIps[i];
        var generatorIpTokens = generatorIp.split(".");
        for(var j = 0; j < browserIps.length; j++) {
            var browserIp = browserIps[j];
            var browserIpTokens = browserIp.split(".");
            if(browserIpTokens[0] == generatorIpTokens[0] && 
                browserIpTokens[1] == generatorIpTokens[1] &&
                browserIpTokens[2] == generatorIpTokens[2]) {
                    result.push(browserIp);
            }
        }
    }

    return result;
}

async function getTimeStampForLocalIp(browserIp) {
    var timestamp = GetSessionKey("browseripstime", browserIp)
    return timestamp
}

var startNotificationID = null;

chrome.notifications.create(uuidv4(), {
    title: 'NetClave Unlocking Reminder',
    iconUrl: 'images/blackvisor_128.png',
    type: 'basic',
    requireInteraction: true,
    buttons: [{title: "Unlock"}, {title: "Continue"}],
    message: "No NetClave wallet is unlocked. In order to start NetClave session please click Unlock"
}, function(id) {
    startNotificationID = id;
});

chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
    if (notifId === startNotificationID) {
        if (btnIdx === 0) {
            chrome.windows.create({'url': 'index.html', 'type': 'popup', 'width' : 510, 'height' : 445}, function(window) {
            });
        }
    }
});

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.windows.create({'url': 'index.html', 'type': 'popup', 'width' : 510, 'height' : 445}, function(window) {
    });
});

setInterval(function() {
    if(currentWallet != null) {
        console.log("setting up light version")
        chrome.browserAction.setIcon({
            path : {
            "16": "images/blackvisor_light_16.png",
            "32": "images/blackvisor_light_32.png",
            "64": "images/blackvisor_light_64.png",
            "128": "images/blackvisor_light_128.png"
        }});
    } else {
        console.log("setting up dark version")
        chrome.browserAction.setIcon({
            path : {
            "16": "images/blackvisor_16.png",
            "32": "images/blackvisor_32.png",
            "64": "images/blackvisor_64.png",
            "128": "images/blackvisor_128.png"
        }});
        
    }
}, 200);

async function getIPs() {
    var ips = await getLocalIPs();
}


setInterval(async function() {
        if(currentWallet != null) {
            var timestamp = new Date().getTime() + ""
            var browserIps = await getLocalIPs();
            
            var generatorsList = GetIdentificatorToIdentificatorMap(currentWallet, IDENTIFICATOR_TYPE_GENERATOR)
            
            console.log(browserIps);
            console.log(generatorsList);

            var found = false;

            var identityProviderToToken = {};

            for (var generatorID in generatorsList) {
                if (!generatorsList.hasOwnProperty(generatorID)) continue;
                var generatorIpsJson = GetSessionKey(LOCALIPS, generatorID)
                var generatorIps = JSON.parse(generatorIpsJson);
                
                if(generatorIps == null) {
                    generatorIps = [];
                }

                for(var i = 0; i < generatorIps.length; i++) {
                    var generatorIp = generatorIps[i];
                    var generatorIpTokens = generatorIp.split(".");
                    for(var j = 0; j < browserIps.length; j++) {
                        var browserIp = browserIps[j];
                        var browserIpTokens = browserIp.split(".");
                        if(browserIpTokens[0] == generatorIpTokens[0] && 
                            browserIpTokens[1] == generatorIpTokens[1] &&
                            browserIpTokens[2] == generatorIpTokens[2]) {
                                var url = "http://" + generatorIp + ":8081"
                                console.log(url);
                                var tokens = await listTokensForGenerator(url, generatorID)
                                
                                if(tokens == null) {
                                    continue;
                                }
                                var timeStamp = Math.floor(Date.now());
                                SetSessionKey("browseripstime", browserIp, timeStamp)

                                var tokensMap = tokens.response;

                                for (var identityProviderID in tokensMap) {
                                    if (!tokensMap.hasOwnProperty(identityProviderID)) continue;

                                    identityProviderToToken[identityProviderID] = tokensMap[identityProviderID];
                                }                                

                                found = true;
                                break;
                            }
                    }

                    if(found == true) {
                        break;
                    }
                }
            }

            for (var identityProviderID in identityProviderToToken) {
                var servicesJson = GetSessionKey(SERVICES, identityProviderID)

                var services = JSON.parse(servicesJson);

                if (!identityProviderToToken.hasOwnProperty(identityProviderID)) continue;
                
                var token = identityProviderToToken[identityProviderID];
            
                var signedData = await signMessage(token, currentPrivateKey)

                console.log("Data:" + signedData);

                for(var i = 0; i < services.length; i++) {
                    console.log("Setting for service: " +  "https://" + services[i])
                    chrome.cookies.set({
                        url: "https://" + services[i],
                        name: "netclave-token-"+identityProviderID,
                        value: currentWallet.IdentificatorID + "," + token + "," + signedData,
                        domain: services[i]
                    });

                    chrome.cookies.set({
                        url: "http://" + services[i],
                        name: "netclave-token-"+identityProviderID,
                        value:  currentWallet.IdentificatorID + "," + token + "," + signedData,
                        domain: services[i]
                    });
                }

                var timeStamp = Math.floor(Date.now());

                SetSessionKey("cookiesettime", identityProviderID, timeStamp)
            }
        }
    }, 
1000);

setInterval(async function() {
    if(currentWallet != null) {
        var identityProviders = await listIdentityProvidersForCurrentWallet();
        //console.log(identityProviders);

        for (var identityProviderID in identityProviders) {
            // skip loop if the property is from prototype
            if (!identityProviders.hasOwnProperty(identityProviderID)) continue;

            var identityProvider = identityProviders[identityProviderID];
            var url = identityProvider["url"];

            var sharedIdentificators = await listPublicKeysForIdentificator(url, identityProviderID)

            if(sharedIdentificators == null) {
                continue;
            }

            console.log(sharedIdentificators);

            var responseMap = sharedIdentificators.response;

            for (var identificatorID in responseMap) {
                if (!responseMap.hasOwnProperty(identificatorID)) continue;
                var value = responseMap[identificatorID];

                var tokens = value.split(",");

                var identificatorType = tokens[1];
                var publicKey = tokens[2];

                StorePublicKey(identificatorID, publicKey)
                var identificator = CreateIdentificator(identificatorID, identificatorType)
                
                AddIdentificator(identificator)
                AddIdentificatorToIdentificator(currentWallet, identificator)
                AddIdentificatorToIdentificator(identificator, currentWallet)
                AddIdentificatorToIdentificator(identityProvider, identificator)
                AddIdentificatorToIdentificator(identificator, identityProvider)
            }

            var generatorIps = await listGeneratorIPs(url, identityProviderID);
            var generatorIpsMap = generatorIps.response;

            for (var identificatorID in generatorIpsMap) {
                if (!generatorIpsMap.hasOwnProperty(identificatorID)) continue;
                var value = generatorIpsMap[identificatorID];
                var jsonValue = JSON.stringify(value);
                SetSessionKey(LOCALIPS, identificatorID, jsonValue)
            }
        
            var services = await listServices(url, identityProviderID);

            var jsonServices = JSON.stringify(services.response);
            SetSessionKey(SERVICES, identityProviderID, jsonServices)
        }
    }
}, 
1000);


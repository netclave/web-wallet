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

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
  }

  async function generateKey(alg, scope) {
    return crypto.subtle.generateKey(alg, true, scope);
  }

  function arrayBufferToBase64String(arrayBuffer) {
    var byteArray = new Uint8Array(arrayBuffer)
    var byteString = ''
    for (var i=0; i<byteArray.byteLength; i++) {
      byteString += String.fromCharCode(byteArray[i])
    }
    return btoa(byteString)
  }

  function base64StringToArrayBuffer(b64str) {
    var byteStr = atob(b64str)
    var bytes = new Uint8Array(byteStr.length)
    for (var i = 0; i < byteStr.length; i++) {
      bytes[i] = byteStr.charCodeAt(i)
    }
    return bytes.buffer
  }

  function textToArrayBuffer(str) {
    var buf = unescape(encodeURIComponent(str)) // 2 bytes for each char
    var bufView = new Uint8Array(buf.length)
    for (var i=0; i < buf.length; i++) {
      bufView[i] = buf.charCodeAt(i)
    }
    return bufView
  }

  function arrayBufferToText(arrayBuffer) {
    var byteArray = new Uint8Array(arrayBuffer)
    var str = ''
    for (var i=0; i<byteArray.byteLength; i++) {
      str += String.fromCharCode(byteArray[i])
    }
    return str
  }

  function arrayBufferToBase64(arr) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(arr)))
  }

  function convertBinaryToPem(binaryData, label) {
    var base64Cert = arrayBufferToBase64String(binaryData)
    var pemCert = "-----BEGIN " + label + "-----\r\n"
    var nextIndex = 0
    var lineLength
    while (nextIndex < base64Cert.length) {
      if (nextIndex + 64 <= base64Cert.length) {
        pemCert += base64Cert.substr(nextIndex, 64) + "\r\n"
      } else {
        pemCert += base64Cert.substr(nextIndex) + "\r\n"
      }
      nextIndex += 64
    }
    pemCert += "-----END " + label + "-----\r\n"
    return pemCert
  }

  function convertPemToBinary(pem) {
    var lines = pem.split('\n')
    var encoded = ''
    for(var i = 0;i < lines.length;i++){
      if (lines[i].trim().length > 0 &&
          lines[i].indexOf('-BEGIN RSA PRIVATE KEY-') < 0 &&
          lines[i].indexOf('-BEGIN PUBLIC KEY-') < 0 &&
          lines[i].indexOf('-END RSA PRIVATE KEY-') < 0 &&
          lines[i].indexOf('-END PUBLIC KEY-') < 0) {
        encoded += lines[i].trim()
      }
    }
    return base64StringToArrayBuffer(encoded)
  }

  async function importPublicKey(pemKey, algorithm, usages) {     
      return crypto.subtle.importKey("spki", convertPemToBinary(pemKey), algorithm, true, usages);
  }

  async function importPrivateKey(pemKey, algorithm, usages) {
      return crypto.subtle.importKey("pkcs8", convertPemToBinary(pemKey), algorithm, true, usages);
  }

  async function exportPublicKey(keys) {
      return convertBinaryToPem(await window.crypto.subtle.exportKey('spki', keys.publicKey), "PUBLIC KEY");
  }

  async function exportPrivateKey(keys) {
      return convertBinaryToPem(await window.crypto.subtle.exportKey('pkcs8', keys.privateKey), "RSA PRIVATE KEY")
  }

  async function exportPemKeys(keys) {
      return {publicKey: await exportPublicKey(keys), privateKey: await exportPrivateKey(keys)}
  }

  async function signData(key, data) {
    return window.crypto.subtle.sign(signAlgorithm, key, data)
  }

  async function signDataSync(key, data) {
    var dataBlob = textToArrayBuffer(data)
    var signatureBlob = await signData(key, dataBlob)
    return arrayBufferToBase64String(signatureBlob)
  }

  async function verifySignature(pub, sig, data) {
    return crypto.subtle.verify(signAlgorithm, pub, sig, data)
  }

  async function verifySignatureSync(pub, sig, data) {
    var dataBlob = textToArrayBuffer(data)
    var signatureBlob = base64StringToArrayBuffer(sig)
    return verifySignature(pub, signatureBlob, dataBlob)
  }

  async function encryptData(vector, key, data) {
    return crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
        iv: vector
      },
      key,
      data
    )
  }

  async function encryptDataSync(vector, key, data) {
      var dataArray = textToArrayBuffer(data)
      var encryptedBlob = await encryptData(vector, key, dataArray)
      return arrayBufferToBase64String(encryptedBlob)
  }

  async function decryptData(vector, key, data) {
    return crypto.subtle.decrypt(
        {
          name: "RSA-OAEP",
          iv: vector
        },
        key,
        data
    )
  }

  async function decryptDataSync(vector, key, data) {
      var dataArray = base64StringToArrayBuffer(data)
      var decryptedBlob = await decryptData(vector, key, dataArray)
      return arrayBufferToText(decryptedBlob)
  }

  // Test everything
  var signAlgorithm = {
    name: "RSA-PSS",
    saltLength: 32,
    hash: {
      name: "SHA-256"
    },
    modulusLength: 2048,
    extractable: true,
    publicExponent: new Uint8Array([1, 0, 1])
  }

  var encryptAlgorithm = {
    name: "RSA-OAEP",
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    extractable: true,
    hash: {
      name: "SHA-256"
    }
  }

  function arrayBufferToBase64(arr) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(arr)))
  }

  async function generateAesKey() {
    return window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256, //can be  128, 192, or 256
        },
        true, //whether the key is extractable (i.e. can be used in exportKey)
        ["encrypt", "decrypt"] //can "encrypt", "decrypt", "wrapKey", or "unwrapKey"
    );
  }

  async function exportAesKey(key) {
      var keyBlob = await window.crypto.subtle.exportKey(
            "raw", //can be "jwk" or "raw"
            key //extractable must be true
      );

      return arrayBufferToBase64String(keyBlob);
  }

  async function importAesKey(keyBase64) {
    var blob = base64StringToArrayBuffer(keyBase64)
    return window.crypto.subtle.importKey(
        "raw", //can be "jwk" or "raw"
        blob,
        {   //this is the algorithm options
            name: "AES-GCM",
        },
        true, //whether the key is extractable (i.e. can be used in exportKey)
        ["encrypt", "decrypt"] //can "encrypt", "decrypt", "wrapKey", or "unwrapKey"
    )
  }

  async function aesEncrypt(data, key) {
    var ivBlob = window.crypto.getRandomValues(new Uint8Array(12));
    var dataBlob = textToArrayBuffer(data);
    var cipherTextBlob = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",

            //Don't re-use initialization vectors!
            //Always generate a new iv every time your encrypt!
            //Recommended to use 12 bytes length
            iv: ivBlob
        },
        key, //from generateKey or importKey above
        dataBlob //ArrayBuffer of data you want to encrypt
    );

    var ivBase64 = arrayBufferToBase64String(ivBlob);
    var cipherTextBase64 = arrayBufferToBase64String(cipherTextBlob);

    return {"iv" : ivBase64, "ciphertext": cipherTextBase64};
  }

  async function aesDecrypt(ivBase64, cipherTextBase64, key) {
    var ivBlob = base64StringToArrayBuffer(ivBase64)
    var cipherTextBlob = base64StringToArrayBuffer(cipherTextBase64)

    var plainTextBlob = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: ivBlob, //The initialization vector you used to encrypt
        },
        key, //from generateKey or importKey above
        cipherTextBlob //ArrayBuffer of the data
    )

    return arrayBufferToText(plainTextBlob)
  }
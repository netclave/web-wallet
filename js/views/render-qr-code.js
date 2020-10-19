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

async function calculateQRCode(...args) {
    var requestObj = createRequestObject("getIdentityProviderSharingQRCode", args)
    return sendMessageToBackground(requestObj)
}

async function sendWalletPendingRequest(...args) {
    var requestObj = createRequestObject("sendWalletPendingRequest", args)
    return sendMessageToBackground(requestObj)
}

function renderQRCode(args) {
    var context = createContext()
    context["pincodeError"] = ""
    context["pincode"] = ""
    context["urlError"] = ""
    context = mergeContext(context, args)
    renderTemplate("render-qr-code", context, async function(html) {
        putToDiv("app", context, html)
        var internalContext = createContext();
        internalContext["walletID"] = args["walletID"];
        
        jQuery("#backToWallet").click(async function(){
            renderWalletProfile(internalContext);
            return;
        });

        var identityProviderIdentificator = context["IdentificatorID"];
        var walletIdentificator = context["walletid"];
        
        var internalContext = createContext();
        internalContext["walletID"] =  walletIdentificator;
    
        var data = await calculateQRCode(identityProviderIdentificator);

        if(data === null || data === "") {
            internalContext["errorMessage"] = "Can not calculate qr code";
            renderWalletProfile(internalContext);
            return;
        }

        console.log(data);

        var qrcode = new QRCode("qrcode", {
            text: data,
            width: 240,
            height: 240,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.M
        });

        jQuery("#sendQRCode").click(async function(){
            var generatorUrl = document.getElementById('external-generator-url').value;
            var comment = document.getElementById('comment').value;
            
            var internalContext = createContext();
            internalContext["walletID"] = args["walletID"];
            internalContext["IdentificatorID"] = args["IdentificatorID"];

            var hasError = false;
            if(generatorUrl == null || generatorUrl == "") {
                internalContext["urlError"] = "Url is required and must not be empty!";
                internalContext["hasErrorUrl"] = "has-error";
                hasError = true;
            }

            if (hasError == true) {
                renderQRCode(internalContext)
            } else {
                console.log("Sending request")
                var response = sendWalletPendingRequest(generatorUrl, data, comment);
                if(response === null || response === "") {
                    internalContext["errorMessage"] = "Can not send QR code for review";
                    renderWalletProfile(internalContext);
                    return;
                }

                internalContext["successMessage"] = "QR Code request succesfully sent";
                renderQRCode(internalContext)
            }
            return;
        });

        $("#qrcodetext").text(data);
    });
}
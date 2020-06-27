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

async function changePincode(...args) {
    var requestObj = createRequestObject("changeWalletPincode", args)
    return sendMessageToBackground(requestObj)
}

function renderWalletChangePincode(args) {
    var context = createContext()
    context["oldPincodeError"] = ""
    context["pincodeError"] = ""
    context["oldPincode"] = ""
    context["pincode"] = ""
    context["pincodeRepeat"] = ""
    context = mergeContext(context, args)
    renderTemplate("wallet-change-pincode", context, function(html) {
        putToDiv("app", context, html)

        jQuery("#backToWallets").click(async function(){
            renderHome();
        });

        jQuery("#changePincode").click(async function(){
            var clicked = $(this);
            var walletIdentificator = clicked.data("identificatorid");
            var walletOldPincode = document.getElementById('change-pincode-wallet-oldpincode').value;
            var walletPincode = document.getElementById('change-pincode-wallet-pincode').value;
            var walletPincodeRepeat = document.getElementById('change-pincode-wallet-pincode-repeat').value;
            var internalContext = createContext();
            internalContext["walletID"] = walletIdentificator;
            var hasError = false;
            if(walletOldPincode == null || walletOldPincode == "") {
                internalContext["oldPincodeError"] = "Old pincode is required and must not be empty!";
                internalContext["hasErrorOldPincode"] = "has-error";
                hasError = true;
            }

            if(walletPincode == null || walletPincode == "") {
                internalContext["pincodeError"] = "Pincode is required and must not be empty";
                internalContext["hasErrorPincode"] = "has-error";
                hasError = true;
            } else {
                if(walletPincodeRepeat == null || walletPincodeRepeat == "") {
                    internalContext["pincodeError"] = "Pincode is required and must not be empty";
                    internalContext["hasErrorPincode"] = "has-error";
                    hasError = true;
                } else {
                    if(walletPincodeRepeat != walletPincode) {
                        internalContext["pincodeError"] = "Pincodes do not match";
                        internalContext["hasErrorPincode"] = "has-error";
                        hasError = true;
                    }
                }
            }

            if(hasError == true) {
                renderWalletChangePincode(internalContext)
            } else {
                var error = await changePincode(walletIdentificator, walletOldPincode, walletPincode, walletPincodeRepeat);
                if(error !== null) {
                    console.log(error)
                    internalContext["errorMessage"] = error;
                    renderWalletChangePincode(internalContext);
                } else {
                    internalContext["successMessage"] = "Wallet pincode changed successfully";
                    renderHome(internalContext);
                }
            }
        });
    });
}
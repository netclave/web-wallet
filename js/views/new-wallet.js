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

async function createWallet(...args) {
    var requestObj = createRequestObject("createNewWallet", args)
    return sendMessageToBackground(requestObj)
}

function renderNewWallet(args) {
    var context = createContext()
    context["nameError"] = ""
    context["pincodeError"] = ""
    context["name"] = ""
    context["pincode"] = ""
    context["pincodeRepeat"] = ""
    context = mergeContext(context, args)
    renderTemplate("new-wallet", context, function(html) {
        putToDiv("app", context, html)

        jQuery("#backToWallets").click(async function(){
            renderHome();
        });

        jQuery("#addWallet").click(async function(){
            var walletName = document.getElementById('new-wallet-name').value;
            var walletPincode = document.getElementById('new-wallet-pincode').value;
            var walletPincodeRepeat = document.getElementById('new-wallet-pincode-repeat').value;
            var internalContext = createContext();
            var hasError = false;
            if(walletName == null || walletName == "") {
                internalContext["nameError"] = "Name is required and must not be empty!";
                internalContext["hasErrorName"] = "has-error";
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
                internalContext["name"] = walletName;
                renderNewWallet(internalContext)
            } else {
                var id = await createWallet(walletName, walletPincode, walletPincodeRepeat);
                
                console.log(id);

                if(id == null) {
                    internalContext["errorMessage"] = "Internal Error";
                } else {
                    internalContext["successMessage"] = "Wallet added successfully";
                }

                renderHome(internalContext);
            }
        });
    });
}
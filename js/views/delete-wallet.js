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

async function deleteWallet(...args) {
    var requestObj = createRequestObject("deleteWallet", args)
    return sendMessageToBackground(requestObj)
}

function renderDeleteWallet(args) {
    var context = createContext()
    context["pincodeError"] = ""
    context["pincode"] = ""
    context = mergeContext(context, args)
    renderTemplate("delete-wallet", context, function(html) {
        putToDiv("app", context, html)

        jQuery("#backToWallets").click(async function(){
            renderHome();
        });

        jQuery("#deleteWallet").click(async function(){
            var walletPincode = document.getElementById('delete-wallet-pincode').value;
            var clicked = $(this);
            var walletIdentificator = clicked.data("identificatorid");

            var internalContext = createContext();
            internalContext["walletID"] = walletIdentificator;
            
            var hasError = false;

            if(walletPincode == null || walletPincode == "") {
                internalContext["pincodeError"] = "Pincode is required and must not be empty";
                internalContext["hasErrorPincode"] = "has-error";
                hasError = true;
            }

            if(hasError == true) {
                renderDeleteWallet(internalContext)
            } else {
                var error = await deleteWallet(walletIdentificator, walletPincode)                
                if(error !== null) {
                    internalContext["errorMessage"] = error;
                } else {
                    internalContext["successMessage"] = "Wallet deleted successfully";
                }
                
                if(error !== null) {
                    renderDeleteWallet(internalContext);
                } else {
                    renderHome(internalContext);
                }
            }
        });
    });
}
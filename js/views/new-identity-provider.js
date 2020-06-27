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

async function registerNewIdentityProvider(...args) {
    var requestObj = createRequestObject("registerNewIdentityProvider", args)
    return sendMessageToBackground(requestObj)
}

function renderNewIdentityProvider(args) {
    var context = createContext()
    context["urlError"] = ""
    context["identificatorError"] = ""
    context["url"] = ""
    context["identificator"] = ""
    context = mergeContext(context, args)
    renderTemplate("new-identity-provider", context, function(html) {
        putToDiv("app", context, html)

        jQuery("#backToWallet").click(async function(){
            renderWalletProfile(args);
        });

        jQuery("#addIdentityProvider").click(async function(){
            var url = document.getElementById('new-identity-provider-url').value;
            var identificator = document.getElementById('new-identity-provider-identificator').value;
            var internalContext = createContext();
            internalContext["walletID"] = args["walletID"];
            var hasError = false;
            if(url == null || url == "") {
                internalContext["urlError"] = "Url is required and must not be empty!";
                internalContext["hasErrorUrl"] = "has-error";
                hasError = true;
            }

            if(identificator == null || identificator == "") {
                internalContext["identificatorError"] = "Identificator is required and must not be empty";
                internalContext["hasErrorIdentificator"] = "has-error";
                hasError = true;
            } 

            internalContext["url"] = url;
            internalContext["identificator"] = identificator;

            if(hasError == true) {
                renderNewIdentityProvider(internalContext)
            } else {
                var success = await registerNewIdentityProvider(url, identificator);
                
                console.log(success);

                if(success === "") {
                    internalContext["errorMessage"] = "Can not register in identity provider";
                    renderNewIdentityProvider(internalContext);
                } else {
                    internalContext["identityProviderIdentificator"] = success;
                    renderNewIdentityProviderConfirmCode(internalContext);
                }
            }
        });
    });
}
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

async function confirmNewIdentityProvider(...args) {
    var requestObj = createRequestObject("confirmIdentityProvider", args)
    return sendMessageToBackground(requestObj)
}

function renderNewIdentityProviderConfirmCode(args) {
    console.log("In renderNewIdentityProviderConfirmCode")
    console.log(args)

    var context = createContext()
    context["confirmationCodeError"] = ""
    context = mergeContext(context, args)
    renderTemplate("new-identity-provider-confirm-code", context, function(html) {
        putToDiv("app", context, html)

        jQuery("#cancelNewIdentityProviderConfirmCode").click(async function(){
            renderNewIdentityProvider(args);
        });

        jQuery("#confirmCode").click(async function(){
            var confirmationCode = document.getElementById('new-identity-provider-confirmation-code').value;
            var internalContext = createContext();
            internalContext["walletID"] = args["walletID"];
            var hasError = false;
            if(confirmationCode == null || confirmationCode == "") {
                internalContext["confirmationCodeError"] = "Confirmation code is empty! Try again";
                internalContext["hasErrorConfirmationCode"] = "has-error";
                hasError = true;
            }

            internalContext = mergeContext(internalContext, args)

            if(hasError == true) {
                renderNewIdentityProviderConfirmCode(internalContext)
            } else {
                url = args["url"];
                identificator = args["identificator"];
                identityProviderIdentificator = args["identityProviderIdentificator"];

                var success = await confirmNewIdentityProvider(url, 
                    identityProviderIdentificator, 
                    confirmationCode);
                
                console.log(success);

                if(success === false) {
                    internalContext["errorMessage"] = "Can not confirm identity provider";
                    renderNewIdentityProviderConfirmCode(internalContext);
                } else {
                    internalContext["successMessage"] = "Identity Provider added successfully";
                    renderWalletProfile(internalContext);
                }

                
            }
        });
    });
}
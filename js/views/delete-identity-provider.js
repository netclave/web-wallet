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

async function deleteIdentityProvider(...args) {
    var requestObj = createRequestObject("deleteIdentityProvider", args)
    return sendMessageToBackground(requestObj)
}

function renderDeleteIdentityProvider(args) {
    var context = createContext()
    context["pincodeError"] = ""
    context["pincode"] = ""
    context = mergeContext(context, args)
    renderTemplate("delete-identity-provider", context, function(html) {
        putToDiv("app", context, html)
        var internalContext = createContext();
        internalContext["walletID"] = args["walletID"];
        
        jQuery("#backToWallet").click(async function(){
            renderWalletProfile(internalContext);
        });

        jQuery("#deleteIdentityProvider").click(async function(){
            var clicked = $(this);
            //console.log(clicked.data("identificatorid"));
            var identityProviderIdentificator = clicked.data("identificatorid");
            var url = clicked.data("url");
            var walletIdentificator = clicked.data("walletid");
            
            var internalContext = createContext();
            internalContext["walletID"] =  walletIdentificator;
            
            var url = args["url"]

            var error = await deleteIdentityProvider(url, identityProviderIdentificator)                
            if(error !== null) {
                internalContext["errorMessage"] = error;
            } else {
                internalContext["successMessage"] = "Identity Provider deleted successfully";
            }
            
            renderWalletProfile(internalContext);
        });
    });
}
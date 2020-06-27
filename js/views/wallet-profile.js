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

async function releaseWallet(...args) {
    var requestObj = createRequestObject("releaseCurrentWallet", args)
    return sendMessageToBackground(requestObj)
}

async function listIdentityProvidersForCurrentWallet(...args) {
    var requestObj = createRequestObject("listIdentityProvidersForCurrentWallet", args)
    return sendMessageToBackground(requestObj)
}

async function getIdentityProviderCookieTimeStamp(...args) {
    var requestObj = createRequestObject("getIdentityProviderCookieTimeStamp", args)
    return sendMessageToBackground(requestObj)
}

var timestampListeners = [];

async function cancelTimestampListeners() {
    for(var i = 0; i < timestampListeners.length; i++) {
        clearInterval(timestampListeners[i]);
    }
    timestampListeners = [];
}

async function renderIdentityProviderRow(args) {
    console.log(args)
    var listener = setInterval(async function() {
        console.log("After render identity provider row")
        var timestamp = await getIdentityProviderCookieTimeStamp(args["IdentificatorID"])

        if(timestamp == "") {
            timestamp = 0
        }

        var currentTimeStamp = Math.floor(Date.now());

        var delta = (currentTimeStamp - timestamp)

        var cssSelector = "#identity-provider-check-" + args["IdentificatorID"]

        console.log(cssSelector);

        if(delta > 60000) {
            console.log("Setting red")
            $(cssSelector).attr("style", "background-color: #A53127 !important;border: .05rem solid #A53127 !important;")
        } else {
            console.log("Setting green")
            $(cssSelector).attr("style", "background-color: #2D5B04 !important;border: .05rem solid #2D5B04 !important;")
        }
    }, 1000);

    timestampListeners.push(listener)

    return new Promise(resolve => {
        var context = createContext()
        context = mergeContext(context, args)
        renderTemplate("identity-provider-row", context, function(html) {
            resolve(html);
        });
    });
}

async function renderWalletProfile(args) {
    var context = createContext()
    var identityProviders = await listIdentityProvidersForCurrentWallet()
    var identityProvidersHtml = ""
    for(key in identityProviders) {
        var identityProvider = identityProviders[key];
        identityProvider["walletID"] = args["walletID"];
        var identityProviderHTML = await renderIdentityProviderRow(identityProvider)
        identityProvidersHtml += identityProviderHTML;
    }

    var message = ""
    var showRows = "initial"
    var showMessage = "none"

    if(identityProvidersHtml == null || identityProvidersHtml == "") {
        message = "No identity providers found. Please add!"
        var showRows = "none"
        var showMessage = "initial"
    }

    context["rows"] = identityProvidersHtml;
    context["message"] = message;
    context["showRows"] = showRows;
    context["showMessage"] = showMessage;

    context = mergeContext(context, args)
    renderTemplate("wallet-profile", context, function(html) {
        putToDiv("app", context, html)
        
        jQuery("#releseWallet").click(async function(){
            var clicked = $(this);
            var walletIdentificator = clicked.data("identificatorid");
            var released = await releaseWallet(walletIdentificator);
            if(released == true) {
                var internalContext = createContext();
                internalContext["successMessage"] = "Wallet released successfully";
                cancelTimestampListeners();
                renderHome(internalContext);
            }
        });

        jQuery("#addNewIdentityProvider").click(async function(){
            var clicked = $(this);
            var walletIdentificator = clicked.data("identificatorid");
            var internalContext = createContext();
            internalContext["walletID"] = walletIdentificator;
            cancelTimestampListeners();
            renderNewIdentityProvider(internalContext);
        });

        jQuery(".identity-provider-profile").click(function(){
            var clicked = $(this);
            //console.log(clicked.data("identificatorid"));
            var internalContext = createContext();
            internalContext["IdentificatorID"] = clicked.data("identificatorid");
            internalContext["url"] = clicked.data("url");
            var walletIdentificator = clicked.data("walletid");
            internalContext["walletID"] = walletIdentificator;
            cancelTimestampListeners();
            renderIdentityProviderProfile(internalContext);
        });

        jQuery(".delete-identity-provider").click(function(){
            var clicked = $(this);
            //console.log(clicked.data("identificatorid"));
            var internalContext = createContext();
            internalContext["IdentificatorID"] = clicked.data("identificatorid");
            internalContext["url"] = clicked.data("url");
            var walletIdentificator = clicked.data("walletid");
            internalContext["walletID"] = walletIdentificator;
            cancelTimestampListeners();
            renderDeleteIdentityProvider(internalContext);
        });

        jQuery(".open-qr-code").click(function(){
            var clicked = $(this);
            //console.log(clicked.data("identificatorid"));
            var internalContext = createContext();
            internalContext["IdentificatorID"] = clicked.data("identificatorid");
            internalContext["url"] = clicked.data("url");
            var walletIdentificator = clicked.data("walletid");
            internalContext["walletID"] = walletIdentificator;
            cancelTimestampListeners();
            renderQRCode(internalContext);
        });
    });
}
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

async function listWallets(...args) {
    var requestObj = createRequestObject("listWallets", args)
    return sendMessageToBackground(requestObj)
}

async function renderWalletRow(args) {
    return new Promise(resolve => {
        var context = createContext()
        context = mergeContext(context, args)
        renderTemplate("wallet-row", context, function(html) {
            resolve(html);
        });
    });
}

async function renderHome(args) {
    console.log("Render home");
    var context = createContext()
    var wallets = await listWallets()
    var walletsHtml = ""
    for(key in wallets) {
        var wallet = wallets[key];
        var walletHTML = await renderWalletRow(wallet)
        walletsHtml += walletHTML;
    }

    var message = ""
    var showRows = "initial"
    var showMessage = "none"

    if(walletsHtml == null || walletsHtml == "") {
        message = "No key wallets. Please add!"
        var showRows = "none"
        var showMessage = "initial"
    }

    context["rows"] = walletsHtml;
    context["message"] = message;
    context["showRows"] = showRows;
    context["showMessage"] = showMessage;

    context = mergeContext(context, args)
    renderTemplate("home", context, function(html) {
        putToDiv("app", context, html)

        jQuery("#addNewWallet").click(async function(){
            renderNewWallet();
        });

        jQuery(".unlock-wallet").click(function(){
            var clicked = $(this);
            //console.log(clicked.data("identificatorid"));
            var internalContext = createContext();
            internalContext["walletID"] = clicked.data("identificatorid");
            renderUnlockWallet(internalContext);
        });

        jQuery(".change-wallet-pincode").click(async function(){
            var clicked = $(this);
            //console.log(clicked.data("identificatorid"));
            var internalContext = createContext();
            internalContext["walletID"] = clicked.data("identificatorid");
            renderWalletChangePincode(internalContext);
        });

        jQuery(".delete-wallet").click(function(){
            var clicked = $(this);
            //console.log(clicked.data("identificatorid"));
            var internalContext = createContext();
            internalContext["walletID"] = clicked.data("identificatorid");
            renderDeleteWallet(internalContext);
        });
    });
}

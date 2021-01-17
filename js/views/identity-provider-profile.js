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

async function listServicesForIdentityProvider(...args) {
    var requestObj = createRequestObject("listServicesForIdentityProvider", args)
    return sendMessageToBackground(requestObj)
}

async function listGeneratorsForIdentityProvider(...args) {
    var requestObj = createRequestObject("listGeneratorsForIdentityProvider", args)
    return sendMessageToBackground(requestObj)
}

async function listIpsInLocalSubnetForGenerator(...args) {
    var requestObj = createRequestObject("listIpsInLocalSubnetForGenerator", args)
    return sendMessageToBackground(requestObj)
}

async function getTimeStampForLocalIp(...args) {
    var requestObj = createRequestObject("getTimeStampForLocalIp", args)
    return sendMessageToBackground(requestObj)
}

async function getTimeStampForInternalGenerator(...args) {
    var requestObj = createRequestObject("getTimeStampForInternalGenerator", args)
    return sendMessageToBackground(requestObj)
}

async function listCapabilitiesForIdentityProvider(...args) {
    var requestObj = createRequestObject("listCapabilitiesForIdentityProviderFromFrontEnd", args)
    return sendMessageToBackground(requestObj)
}

var listeners = [];

async function cancelListeners() {
    for(var i = 0; i < listeners.length; i++) {
        clearInterval(listeners[i]);
    }
    listeners = [];
}

async function renderServices(args) {
    var identityProviderId = args["IdentificatorID"];
    var services = await listServicesForIdentityProvider(identityProviderId)

    var servicesHtml = ""

    if (services != null) {
        for(var i = 0; i < services.length; i++) {
            servicesHtml += "<span class=\"label label-rounded\">" + services[i] + "</span>";

            if(i > 0 && i % 2 == 0) {
                servicesHtml += "<br>";
            } else {
                servicesHtml += "&nbsp;";
            }
        }
    }

    if(servicesHtml == "") {
        servicesHtml = "No services";
    }

    console.log(servicesHtml);
    jQuery("#services").html(servicesHtml);
}

async function renderGeneratorRow(args) {
    return new Promise(resolve => {
        var context = createContext()
        context = mergeContext(context, args)
        renderTemplate("generator-row", context, function(html) {
            resolve(html);
        });
    });
}

async function renderGenerators(args) {
    var identityProviderId = args["IdentificatorID"];
    
    var html = "";

    var context = {};
    context["generatorIdentificator"] = "Internal Web Wallet Genetator";

    var internalGeneratorHTML = "";

    var internalGeneratorTimestamp = await getTimeStampForInternalGenerator(identityProviderId);

    var currentTimeStamp = Math.floor(Date.now());

    var delta = (currentTimeStamp - internalGeneratorTimestamp)

    if(delta > 60000) {
        internalGeneratorHTML += "<span class=\"label label-error label-rounded\">Internal Generator</span>";
    } else {
        internalGeneratorHTML += "<span class=\"label label-success label-rounded\">Internal Generator</span>";
    }

    context["ips"] = internalGeneratorHTML

    var htmlRow = await renderGeneratorRow(context);
    
    html += htmlRow;

    var generators = await listGeneratorsForIdentityProvider(identityProviderId)

    for (var generatorID in generators) {
        if (!generators.hasOwnProperty(generatorID)) continue;
        
        var ips = await listIpsInLocalSubnetForGenerator(generatorID);
        var ipsHtml = ""

        for(var i = 0; i < ips.length; i++) {
            var ip = ips[i];
            var ipTimestamp = await getTimeStampForLocalIp(ip);

            var currentTimeStamp = Math.floor(Date.now());

            var delta = (currentTimeStamp - ipTimestamp)

            if(delta > 60000) {
                ipsHtml += "<span class=\"label label-error label-rounded\">" + ip + "</span>";
            } else {
                ipsHtml += "<span class=\"label label-success label-rounded\">" + ip + "</span>";
            }
        }

        var context = {};
        context["generatorIdentificator"] = generatorID;
        context["ips"] = ipsHtml

        var htmlRow = await renderGeneratorRow(context);

        html += htmlRow;
    }

    console.log(html);

    jQuery("#generators").html(html);
}

async function startListeners(args) {
    var serviceListener = setInterval(async function() {
        await renderServices(args);
    }, 1000);

    listeners.push(serviceListener);

    var generatorListener = setInterval(async function() {
        await renderGenerators(args);
    }, 1000);

    listeners.push(generatorListener);
}

async function renderIdentityProviderProfile(args) {
    var context = createContext()
    
    var message = ""
    var showRows = "initial"
    var showMessage = "none"
    
    context["message"] = message;
    context["showRows"] = showRows;
    context["showMessage"] = showMessage;

    context = mergeContext(context, args)

    renderTemplate("identity-provider-profile", context, function(html) {
        putToDiv("app", context, html)

        renderServices(args);
        renderGenerators(args);
        startListeners(args);

        var internalContext = createContext();
        internalContext["walletID"] = args["walletID"];

        jQuery("#backToWallet").click(async function(){
            cancelListeners()
            renderWalletProfile(internalContext);
        });
    });
}
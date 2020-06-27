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

async function renderTemplateOnBackground(...args) {
    var requestObj = createRequestObject("renderTemplate", args)
    return sendMessageToBackground(requestObj)
}

async function renderTemplate(name, context, loaded) {
    if(window["templates"] == null || window["templates"] == "") {
        window["templates"] = {};
    }

    var script = document.createElement('script');
    script.onload = async function () {
        var source = window["templates"][name];
        var html = await renderTemplateOnBackground(source, context)
        loaded(html)
    };
    script.src = "templates/" + name + ".js";
    document.head.appendChild(script); 
}

function putToDiv(id, context, html) {
    document.getElementById(id).innerHTML = html
    checkForMessages(context);
}

function mergeContext(context1, context2) {
    if((context1 == null || context1 == "") && (context2 == null || context2 == "")) {
        return {}
    }

    if(context1 == null || context1 == "") {
        return context2;
    }

    if(context2 == null || context2 == "") {
        return context1;
    }

    var result = {}

    for(key in context1) {
        result[key] = context1[key];
    }

    for(key in context2) {
        result[key] = context2[key];
    }

    return result
}

function createContext() {
    var context = {}
    context["errorMessage"] = "";
    context["successMessage"] = "";
    return context;
}

function checkForMessages(context) {
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-bottom-center",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }

    if(context["errorMessage"] != null && context["errorMessage"] != "") {
        toastr.error(context["errorMessage"])
    }

    if(context["successMessage"] != null && context["successMessage"] != "") {
        toastr.success(context["successMessage"])
    }

}
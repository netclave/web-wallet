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

window["templates"]["identity-provider-row"] = `
<div class="tile tile-centered identity-provider-row">
    <div class="tile-content">
    <div class="tile-title text-bold">{{url}}</div>
    <div class="tile-content text-center">
    {{capabilities}}
    </div>
    </div>
    <div class="tile-action">
    <button class="btn btn-link btn-action btn-lg tooltip tooltip-left identity-provider-profile" data-identificatorid = "{{IdentificatorID}}" data-url = "{{url}}" data-walletid = "{{walletID}}" data-tooltip="Identity Provider profile"><i class="icon icon-apps"></i></button>
    <button class="btn btn-link btn-action btn-lg tooltip tooltip-left delete-identity-provider" data-identificatorid = "{{IdentificatorID}}" data-url = "{{url}}" data-walletid = "{{walletID}}" data-tooltip="Delete Identity Provider"><i class="icon icon-delete"></i></button>
    <button class="btn btn-link btn-action btn-lg tooltip tooltip-left open-qr-code" data-identificatorid = "{{IdentificatorID}}" data-url = "{{url}}" data-walletid = "{{walletID}}" data-tooltip="Show QR code for generator"><i class="icon icon-link"></i></button>
    <i class = "btn btn-link btn-action btn-lg identity-provider-check icon icon-check" id = "identity-provider-check-{{IdentificatorID}}" data-identificatorid = "{{IdentificatorID}}" data-url = "{{url}}" data-walletid = "{{walletID}}"></i>
    </div>
</div>
`;
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

window["templates"]["wallet-row"] = `
<div class="tile tile-centered text-left">
    <div class="tile-content">
    <div class="tile-title text-bold">{{name}}</div>
    </div>
    <div class="tile-action">
    <button class="btn btn-link btn-action btn-lg tooltip tooltip-left unlock-wallet" data-identificatorid = "{{IdentificatorID}}" data-tooltip="Unlock wallet"><i class="icon icon-people"></i></button>
    <button class="btn btn-link btn-action btn-lg tooltip tooltip-left change-wallet-pincode" data-identificatorid = "{{IdentificatorID}}" data-tooltip="Change pincode"><i class="icon icon-edit"></i></button>
    <button class="btn btn-link btn-action btn-lg tooltip tooltip-left delete-wallet" data-identificatorid = "{{IdentificatorID}}" data-tooltip="Delete wallet"><i class="icon icon-delete"></i></button>
    </div>
</div>
`;
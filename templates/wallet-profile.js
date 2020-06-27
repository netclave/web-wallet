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

window["templates"]["wallet-profile"] = `
<div class="panel">
  <div class="panel-body internal-panel-body text-center">
    {{rows}}
    {{message}}
  </div>
  <div class="panel-footer internal-panel-footer">
    <div class="column col-12 text-center">
        <button class="btn btn-primary" data-identificatorID = "{{walletID}}" id="addNewIdentityProvider">New Identity Provider</button>
        <button class="btn btn-primary" data-identificatorID = "{{walletID}}" id="releseWallet">Release Wallet</button>
    </div>
  </div>
</div>
`;
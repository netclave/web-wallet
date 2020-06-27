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

window["templates"]["delete-wallet"] = `
<div class="panel">
  <div class="panel-body internal-panel-body text-center">
    <div class="column col-9 col-sm-12">
        <form class="form-horizontal" action="#forms">
            <div class="form-group">
                <div class="col-9 col-sm-12">
                </div>
            </div>
            <div class="form-group {{hasErrorPincode}}">
                <div class="col-9 col-sm-12">
                    <input class="form-input" id="delete-wallet-pincode" type="password" placeholder="Pincode" value = "{{pincode}}">
                    <p class="form-input-hint">{{pincodeError}}</p>
                </div>
            </div>
        </form>
    </div>
  </div>
  <div class="panel-footer internal-panel-footer">
    <div class="column col-12 text-center">
        <button class="btn btn-primary" id="deleteWallet" data-identificatorID = "{{walletID}}">Delete Wallet</button>
        <button class="btn btn-primary" id="backToWallets">Back</button>
    </div>
  </div>
</div>
`;
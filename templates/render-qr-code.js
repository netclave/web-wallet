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

window["templates"]["render-qr-code"] = `
<div class="panel">
  <div class="panel-body internal-panel-body panel-body-no-padding text-center">
    <div class="column col-12 col-sm-12 text-center">
        <div id = "qrcode" style = "padding-top: 0.5em; display: inline-block !important;"></div>
        <div style = "padding-left: 1.0em !important; padding-top: 0.4em !important; display: inline-block !important; vertical-align: top !important;" class="form-group {{hasErrorUrl}}">
          <div style = "" class="">
              <input class="form-input" style = "width: 100% !important;" id="external-generator-url" type="text" placeholder="External Generator Url" value = "">
              <textarea class="form-input" style = "margin-top: 0.4em !important; width: 100% !important; height: 200px !important;" id="comment" type="text" placeholder="Write a comment" value = ""></textarea>
              <p class="form-input-hint">{{urlError}}</p>
          </div>
        </div>
    </div>
    <div class="column col-12 col-sm-12 text-justify">
        <div id = "externalUrl"></div>
    </div>

  </div>
  <div class="panel-footer internal-panel-footer">
    <div class="column col-12 text-center">
        <button class="btn btn-primary" id="backToWallet">Back</button>
        <button class="btn btn-primary" id="sendQRCode">Send QR Code</button>
    </div>
  </div>
</div>
`;
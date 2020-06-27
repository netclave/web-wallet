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

window["templates"]["identity-provider-profile"] = `
<div class="panel">
  <div class="panel-body internal-panel-body text-center">
    <div class = "text-center" id = "services" style = "padding-top: 0.5em; padding-bottom: 0.5em; border-bottom-style: solid !important; border-color: rgba(26,26,26, 0.1) !important;">
    </div>
    <div class = "text-center" id = "generators">
    </div>
    {{message}}
  </div>
  <div class="panel-footer internal-panel-footer">
    <div class="column col-12 text-center">
        <button class="btn btn-primary" id="backToWallet">Back</button>
    </div>
  </div>
</div>
`;
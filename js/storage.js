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

async function SetKey(table, key, value) {
    var itemKey = table + "/" + key;

    var obj = {};
    obj[itemKey] = btoa(value);

    await browser.storage.local.set(obj)
}

async function GetKey(table, key) {
    var itemKey = table + "/" + key
    var response = await browser.storage.local.get(itemKey);

    if (response == null) {
        return null;
    }
 
    var result = response[itemKey];

    if (result == null || result == "") {
        return null;
    }

    return atob(result);
}

async function DelKey(table, key) {
    var itemKey = table + "/" + key

    await browser.storage.local.remove(itemKey);
}

async function AddToMap(table, key, objectKey, object) {
    var mapObj = await GetMap(table, key)
    if(mapObj == null) {
        mapObj = {};
    }

    mapObj[objectKey] = object;

    await SetKey(table, key, JSON.stringify(mapObj))
}

async function GetMap(table, key) {
    var mapObj = await GetKey(table, key);

    if(mapObj == null) {
        return {};
    }
    
    return JSON.parse(mapObj)
}

async function DelFromMap(table, key, objectKey) {
    var mapObj = await GetMap(table, key)
    if(mapObj == null) {
        mapObj = {};
    }
    delete mapObj[objectKey];
    await SetKey(table, key, JSON.stringify(mapObj))
}
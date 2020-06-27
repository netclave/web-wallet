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

function SetKey(table, key, value) {
    localStorage.setItem(table + "/" + key, value);
}

function GetKey(table, key) {
    return localStorage.getItem(table + "/" + key)
}

function DelKey(table, key) {
    return localStorage.removeItem(table + "/" + key)
}

function AddToMap(table, key, objectKey, object) {
    var mapObj = GetMap(table, key)
    if(mapObj == null) {
        mapObj = {};
    }
    mapObj[objectKey] = object;
    SetKey(table, key, JSON.stringify(mapObj))
}

function GetMap(table, key) {
    return JSON.parse(GetKey(table, key))
}

function DelFromMap(table, key, objectKey) {
    var mapObj = GetMap(table, key)
    if(mapObj == null) {
        mapObj = {};
    }
    delete mapObj[objectKey];
    SetKey(table, key, JSON.stringify(mapObj))
}
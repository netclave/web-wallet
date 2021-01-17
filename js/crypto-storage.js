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

var PUBLIC_KEYS = "publickeys"
var PUBLIC_KEYS_TEMP = "publickeystemp"
var PRIVATE_KEYS = "privatekeys"
var LABEL_TO_IDENTIFICATOR_ID = "labeltoidentificatorid"
var IDENTIFICATOR_TO_PUBLIC_KEY_LABELS = "identificatortopublickeylabels"
var IDENTIFICATORS = "identificators"
var IDENTIFICATOR_TO_IDENTIFICATOR = "identificatortoidentificator"
var LOCALIPS = "localips"
var SERVICES = "services"


async function StorePublicKey(label, pubKey) {
	await SetKey(PUBLIC_KEYS, label, pubKey)
}

async function RetrievePublicKey(label) {
	return await GetKey(PUBLIC_KEYS, label)
}

async function DeletePublicKey(label) {
	await DelKey(PUBLIC_KEYS, label)
}

async function StoreTempPublicKey(label, pubKey) {
	await SetKey(PUBLIC_KEYS_TEMP, label, pubKey)
}

async function RetrieveTempPublicKey(label) {
	return await GetKey(PUBLIC_KEYS_TEMP, label)
}

async function DeleteTempPublicKey(label) {
	await DelKey(PUBLIC_KEYS_TEMP, label)
}

async function StorePrivateKey(label, priKey) {
	await SetKey(PRIVATE_KEYS, label, priKey)
}

async function RetrievePrivateKey(label) {
	return await GetKey(PRIVATE_KEYS, label)
}

async function DeletePrivateKey(label) {
	await DelKey(PRIVATE_KEYS, label)
}

async function SetIdentificatorByLabel(label, identificatorID) {
	await SetKey(LABEL_TO_IDENTIFICATOR_ID, label, identificatorID)
}

async function GetIdentificatorByLabel(label) {
	return await GetKey(LABEL_TO_IDENTIFICATOR_ID, label)
}

async function DeleteIdentificatorByLabel(label) {
	await DelKey(LABEL_TO_IDENTIFICATOR_ID, label)
}

async function CreateIdentificator(IdentificatorID, IdentificatorType) {
    return {"IdentificatorID": IdentificatorID, "IdentificatorType": IdentificatorType}
}

async function AddIdentificator(identificator) {
	await AddToMap(IDENTIFICATORS, "", identificator.IdentificatorID, identificator)
}

async function DeleteIdentificator(identificatorID) {
	await DelFromMap(IDENTIFICATORS, "", identificatorID)
}

async function GetIdentificators(identificatorType) {
    var identificatorMap = await GetMap(IDENTIFICATORS, "")
    var result = {}
    for(key in identificatorMap){
		var type = identificatorMap[key].IdentificatorType;
        if(type == identificatorType || identificatorType == "") {
            result[key] = identificatorMap[key];
        }
    }
	return result
}

async function AddPublicKeyLabelToIdentificator(identificatorID, label) {
	await AddToMap(IDENTIFICATOR_TO_PUBLIC_KEY_LABELS, identificatorID, label, label)
}

async function DelPublicKeyLabelToIdentificator(identificatorID, label) {
	await DelFromMap(IDENTIFICATOR_TO_PUBLIC_KEY_LABELS, identificatorID, label)
}

async function GetPublicKeyLabelsForIdentificator(identificatorID) {
	return await GetMap(IDENTIFICATOR_TO_PUBLIC_KEY_LABELS, identificatorID)
}

async function AddIdentificatorToIdentificator(identificator1, identificator2) {
	await AddToMap(IDENTIFICATOR_TO_IDENTIFICATOR, identificator1.IdentificatorID, identificator2.IdentificatorID, identificator2.IdentificatorType)
}

async function DelIdentificatorToIdentificator(identificator1, identificator2) {
	await DelFromMap(IDENTIFICATOR_TO_IDENTIFICATOR, identificator1.IdentificatorID, identificator2.IdentificatorID)
}

async function GetIdentificatorToIdentificatorMap(identificator1, identificatorType) {
	var identificatorMap = await GetMap(IDENTIFICATOR_TO_IDENTIFICATOR, identificator1.IdentificatorID)
	var result = {}
    for(key in identificatorMap){
        var type = identificatorMap[key]
        if(type == identificatorType || identificatorType == "") {
            result[key] = type;
        }
    }
	return result
}

async function LoadIdentificatorsByList(identificators, type) {
	var allIdentificators = await GetIdentificators(type)
	var result = {}
    for(key in identificators){
        result[key] = allIdentificators[key];
    }
	return result
}
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


function StorePublicKey(label, pubKey) {
	SetKey(PUBLIC_KEYS, label, pubKey)
}

function RetrievePublicKey(label) {
	return GetKey(PUBLIC_KEYS, label)
}

function DeletePublicKey(label) {
	DelKey(PUBLIC_KEYS, label)
}

function StoreTempPublicKey(label, pubKey) {
	SetKey(PUBLIC_KEYS_TEMP, label, pubKey)
}

function RetrieveTempPublicKey(label) {
	return GetKey(PUBLIC_KEYS_TEMP, label)
}

function DeleteTempPublicKey(label) {
	DelKey(PUBLIC_KEYS_TEMP, label)
}

function StorePrivateKey(label, priKey) {
	SetKey(PRIVATE_KEYS, label, priKey)
}

function RetrievePrivateKey(label) {
	return GetKey(PRIVATE_KEYS, label)
}

function DeletePrivateKey(label) {
	DelKey(PRIVATE_KEYS, label)
}

function SetIdentificatorByLabel(label, identificatorID) {
	SetKey(LABEL_TO_IDENTIFICATOR_ID, label, identificatorID)
}

function GetIdentificatorByLabel(label) {
	return GetKey(LABEL_TO_IDENTIFICATOR_ID, label)
}

function DeleteIdentificatorByLabel(label) {
	DelKey(LABEL_TO_IDENTIFICATOR_ID, label)
}

function CreateIdentificator(IdentificatorID, IdentificatorType) {
    return {"IdentificatorID": IdentificatorID, "IdentificatorType": IdentificatorType}
}

function AddIdentificator(identificator) {
	AddToMap(IDENTIFICATORS, "", identificator.IdentificatorID, identificator)
}

function DeleteIdentificator(identificatorID) {
	DelFromMap(IDENTIFICATORS, "", identificatorID)
}

function GetIdentificators(identificatorType) {
    var identificatorMap = GetMap(IDENTIFICATORS, "")
    var result = {}
    for(key in identificatorMap){
		var type = identificatorMap[key].IdentificatorType;
        if(type == identificatorType || identificatorType == "") {
            result[key] = identificatorMap[key];
        }
    }
	return result
}

function AddPublicKeyLabelToIdentificator(identificatorID, label) {
	AddToMap(IDENTIFICATOR_TO_PUBLIC_KEY_LABELS, identificatorID, label, label)
}

function DelPublicKeyLabelToIdentificator(identificatorID, label) {
	DelFromMap(IDENTIFICATOR_TO_PUBLIC_KEY_LABELS, identificatorID, label)
}

function GetPublicKeyLabelsForIdentificator(identificatorID) {
	return GetMap(IDENTIFICATOR_TO_PUBLIC_KEY_LABELS, identificatorID)
}

function AddIdentificatorToIdentificator(identificator1, identificator2) {
	AddToMap(IDENTIFICATOR_TO_IDENTIFICATOR, identificator1.IdentificatorID, identificator2.IdentificatorID, identificator2.IdentificatorType)
}

function DelIdentificatorToIdentificator(identificator1, identificator2) {
	DelFromMap(IDENTIFICATOR_TO_IDENTIFICATOR, identificator1.IdentificatorID, identificator2.IdentificatorID)
}

function GetIdentificatorToIdentificatorMap(identificator1, identificatorType) {
	var identificatorMap = GetMap(IDENTIFICATOR_TO_IDENTIFICATOR, identificator1.IdentificatorID)
	var result = {}
    for(key in identificatorMap){
        var type = identificatorMap[key]
        if(type == identificatorType || identificatorType == "") {
            result[key] = type;
        }
    }
	return result
}

function LoadIdentificatorsByList(identificators, type) {
	var allIdentificators = GetIdentificators(type)
	var result = {}
    for(key in identificators){
        result[key] = allIdentificators[key];
    }
	return result
}
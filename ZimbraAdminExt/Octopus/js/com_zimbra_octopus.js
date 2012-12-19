ZaOctopus = function() {
	
}
ZaOctopus.APP_OCTOPUS = "octopus";
ZaOctopus.APP_BRIEFCASE = "briefcase";
ZaOctopus.deviceID = "id";
ZaOctopus.deviceName = "name";
ZaOctopus.deviceStatus = "status";
ZaOctopus.deviceCreated = "created";
ZaOctopus.deviceAccessed = "accessed";
ZaOctopus.deviceDisabled = "disabled";
ZaOctopus.A2_device_selection_cache = "device_selection_cache";
ZaOctopus.URN = "urn:zimbraAdmin" ;
ZaEvent.S_AUDIT_REPORT = ZaEvent.EVENT_SOURCE_INDEX++;
ZaEvent.S_AUDIT_TEMPLATE = ZaZimbraAdmin.VIEW_INDEX++;
ZaZimbraAdmin._AUDIT_REPORT_LIST = ZaZimbraAdmin.VIEW_INDEX++;
ZaZimbraAdmin._AUDIT_TEMPLATE_LIST = ZaZimbraAdmin.VIEW_INDEX++;
ZaOperation.RUN_REPORT = ++ ZA_OP_INDEX;
ZaSettings.IS_OCTOPUS = true;

ZaOctopus.getFSAppTypeMsg = function (app) {
    if (app == ZaOctopus.APP_OCTOPUS)  {
        return com_zimbra_octopus.applicationOctopus;
    } else if (app == ZaOctopus.APP_BRIEFCASE) {
    	return com_zimbra_octopus.applicationBriefcase;
    } else {
        return "";
    }
}

ZaOctopus.deviceObjModel = {
	items: [
		{id:ZaOctopus.deviceID, type:_STRING_},
		{id:ZaOctopus.deviceName, type:_STRING_},
		{id:ZaOctopus.deviceStatus, type:_STRING_},
		{id:ZaOctopus.deviceCreated, type:_STRING_},
		{id:ZaOctopus.deviceAccessed, type:_STRING_}
	],
	type:_OBJECT_
}

ZaOctopus.getAccessedTime =
function (serverDate) {
	if (serverDate) {
		return ZaItem.formatServerTime(new String(serverDate));
	}else{
		return com_zimbra_octopus.DeviceNeverAccessed;
	}
}

ZaOctopus.fileSharingAppChoices = [
                             	    {value:ZaOctopus.APP_OCTOPUS, label:ZaOctopus.getFSAppTypeMsg (ZaOctopus.APP_OCTOPUS)},
                             	    {value:ZaOctopus.APP_BRIEFCASE, label:ZaOctopus.getFSAppTypeMsg (ZaOctopus.APP_BRIEFCASE)}
                              ];		

ZaOctopus.loadDevices = function(by, val, withCos) {
	if(this.attrs[ZaAccount.A_zimbraIsExternalVirtualAccount] == "TRUE") {
		return;
	}
	var soapDoc = AjxSoapDoc.create("GetDevicesRequest", ZaOctopus.URN, null);
	var params = {
		soapDoc: soapDoc,
		asyncMode:false,
		callback:null		
	}
	var elBy = soapDoc.set("account", val);
	elBy.setAttribute("by", by);	
	var reqMgrParams = {
		controller : ZaApp.getInstance().getCurrentController(),
		busyMsg : com_zimbra_octopus.BUSY_LOADING_DEVICES
	}
	var resp = ZaRequestMgr.invoke(params, reqMgrParams);
	if(resp && resp.Body && resp.Body.GetDevicesResponse && resp.Body.GetDevicesResponse.device) {
		this.octopus = {};
		this.octopus[ZaAccount.A_octopusDevices] = resp.Body.GetDevicesResponse.device;
	}
	
	//TODO: remove when server adds the attribute
	this.setAttrs[ZaAccount.A_zimbraDeviceAutoLockInteral] = true;
	this.getAttrs[ZaAccount.A_zimbraDeviceAutoLockInteral] = true;
}

ZaOctopus.deviceWipeCallback = function(deviceName,resp) {
	if(resp.isException()) {
		ZaApp.getInstance().getCurrentController()._handleException(resp.getException(), "ZaOctopus.updateDeviceStatusCallback", null, false);
	} else {
		ZaApp.getInstance().getCurrentController().popupMsgDialog(AjxMessageFormat.format(com_zimbra_octopus.WipeRequested,[deviceName]));
		var response = resp.getResponse();
		if(response && response.Body.UpdateDeviceStatusResponse && response.Body.UpdateDeviceStatusResponse.device) {
			this.setInstanceValue(response.Body.UpdateDeviceStatusResponse.device, ZaAccount.A_octopusDevices);
		}
	}
}

ZaOctopus.updateDeviceStatus = function(account, deviceID, status, callback) {
	ZaApp.getInstance().dialogs["confirmMessageDialog"].popdown()
	var soapDoc = AjxSoapDoc.create("UpdateDeviceStatusRequest", ZaOctopus.URN, null);
	var params = {
		soapDoc: soapDoc,
		asyncMode:true,
		callback:callback		
	}
	var elBy = soapDoc.set("account", account.id);
	elBy.setAttribute("by", "id");	
	var elDevice = soapDoc.set("device");
	elDevice.setAttribute(ZaOctopus.deviceID, deviceID);
	elDevice.setAttribute(ZaOctopus.deviceStatus, status);
	var reqMgrParams = {
		controller : ZaApp.getInstance().getCurrentController(),
		busyMsg : com_zimbra_octopus.BUSY_LOADING_DEVICES
	}
	ZaRequestMgr.invoke(params, reqMgrParams);
	/*if(resp && resp.Body && resp.Body.GetDevicesResponse && resp.Body.GetDevicesResponse.device) {
		this.octopus = {};
		this.octopus[ZaAccount.A_octopusDevices] = resp.Body.GetDevicesResponse.device;
	}*/
}

if(ZaAccount) {
	ZaAccount.A_octopusDevices = "octopusDevices";
	ZaAccount.A_zimbraPrefFileSharingApplication = "zimbraPrefFileSharingApplication";
	ZaAccount.A_zimbraFileUploadMaxSizePerFile = "zimbraFileUploadMaxSizePerFile";
	//sharing
	ZaAccount.A2_zimbraExternalShareLimitLifetime = "zimbraExternalShareLimitLifetime";
	ZaAccount.A_zimbraFileExternalShareLifetime = "zimbraFileExternalShareLifetime";
	ZaAccount.A2_zimbraInternalShareLimitLifetime = "zimbraInternalShareLimitLifetime";
	ZaAccount.A_zimbraFileShareLifetime = "zimbraFileShareLifetime";
	ZaAccount.A_zimbraExternalSharingEnabled = "zimbraExternalSharingEnabled";
	ZaAccount.A_zimbraExternalShareWhitelistDomain = "zimbraExternalShareWhitelistDomain";
	ZaAccount.A_zimbraExternalShareDomainWhitelistEnabled = "zimbraExternalShareDomainWhitelistEnabled";
	
	//retention
	ZaAccount.A_zimbraFileExpirationWarningPeriod = "zimbraFileExpirationWarningThreshold";
	ZaAccount.A_zimbraFileLifetime = "zimbraFileLifetime";
	ZaAccount.A_zimbraFileExpirationWarningBody = "zimbraFileExpirationWarningBody";
	ZaAccount.A_zimbraFileExpirationWarningSubject = "zimbraFileExpirationWarningSubject";
	ZaAccount.A_zimbraFileDeletionNotificationBody = "zimbraFileDeletionNotificationBody";
	ZaAccount.A_zimbraFileDeletionNotificationSubject = "zimbraFileDeletionNotificationSubject";
	ZaAccount.A_zimbraFileVersioningEnabled = "zimbraFileVersioningEnabled";
	ZaAccount.A_zimbraFileVersionLifetime = "zimbraFileVersionLifetime";
	ZaAccount.A_zimbraDeviceAutoLockInteral = "zimbraDeviceAutoLockInteral";
	//feature
    ZaAccount.A_zimbraFeatureCrocodocEnabled = "zimbraFeatureCrocodocEnabled";
	if(ZaItem.modelExtensions["ZaAccount"]) {
		ZaItem.modelExtensions["ZaAccount"].push("octopus");
	}	
	
	if(ZaAccount.myXModel) {
		ZaAccount.myXModel.items.push({id:ZaAccount.A_zimbraFileUploadMaxSizePerFile, type:_COS_NUMBER_, ref:"attrs/"+ZaAccount.A_zimbraFileUploadMaxSizePerFile, maxInclusive:2147483648, minInclusive:0});
		ZaAccount.myXModel.items.push({id:ZaAccount.A_zimbraPrefFileSharingApplication, type:_COS_ENUM_, ref:"attrs/"+ZaAccount.A_zimbraPrefFileSharingApplication, choices:ZaOctopus.fileSharingAppChoices});
		ZaAccount.myXModel.items.push({id:ZaAccount.A_octopusDevices, type:_LIST_, ref:"octopus/"+ZaAccount.A_octopusDevices,listItem:ZaOctopus.deviceObjModel});
		ZaAccount.myXModel.items.push({id:ZaOctopus.A2_device_selection_cache, ref:"octopus/"+ZaOctopus.A2_device_selection_cache, type:_LIST_});
		//sharing
		ZaAccount.myXModel.items.push({id:ZaAccount.A_zimbraFileExternalShareLifetime, type:_COS_MLIFETIME_, ref:"attrs/"+ZaAccount.A_zimbraFileExternalShareLifetime});
		ZaAccount.myXModel.items.push({id:ZaAccount.A2_zimbraExternalShareLimitLifetime, type:_COS_ENUM_, ref:ZaAccount.A2_zimbraExternalShareLimitLifetime,  choices:ZaModel.BOOLEAN_CHOICES});
		ZaAccount.myXModel.items.push({id:ZaAccount.A_zimbraExternalSharingEnabled, type:_COS_ENUM_, ref:"attrs/"+ZaAccount.A_zimbraExternalSharingEnabled,  choices:ZaModel.BOOLEAN_CHOICES});
		ZaAccount.myXModel.items.push({id:ZaAccount.A2_zimbraInternalShareLimitLifetime, type:_COS_ENUM_, ref:ZaAccount.A2_zimbraInternalShareLimitLifetime,  choices:ZaModel.BOOLEAN_CHOICES});
		ZaAccount.myXModel.items.push({id:ZaAccount.A_zimbraFileShareLifetime, type:_COS_MLIFETIME_, ref:"attrs/"+ZaAccount.A_zimbraFileShareLifetime});
		ZaAccount.myXModel.items.push({id:ZaAccount.A_zimbraExternalShareDomainWhitelistEnabled, type:_COS_ENUM_, ref:"attrs/"+ZaAccount.A_zimbraExternalShareDomainWhitelistEnabled,  choices:ZaModel.BOOLEAN_CHOICES});
		ZaAccount.myXModel.items.push({id:ZaAccount.A_zimbraExternalShareWhitelistDomain, ref:"attrs/" + ZaAccount.A_zimbraExternalShareWhitelistDomain, type:_COS_LIST_,  itemDelimiter:"\n", dataType:_STRING_,outputType:_STRING_});
		
		//retention
		ZaAccount.myXModel.items.push({id:ZaAccount.A_zimbraFileExpirationWarningPeriod, type:_COS_MLIFETIME_, ref:"attrs/"+ZaAccount.A_zimbraFileExpirationWarningPeriod});
		ZaAccount.myXModel.items.push({id:ZaAccount.A_zimbraFileLifetime, type:_COS_MLIFETIME_, ref:"attrs/"+ZaAccount.A_zimbraFileLifetime});
		ZaAccount.myXModel.items.push({id:ZaAccount.A_zimbraFileExpirationWarningBody, type:_COS_STRING_, ref:"attrs/"+ZaAccount.A_zimbraFileExpirationWarningBody});
		ZaAccount.myXModel.items.push({id:ZaAccount.A_zimbraFileExpirationWarningSubject, type:_COS_STRING_, ref:"attrs/"+ZaAccount.A_zimbraFileExpirationWarningSubject});
		ZaAccount.myXModel.items.push({id:ZaAccount.A_zimbraFileDeletionNotificationBody, type:_COS_STRING_, ref:"attrs/"+ZaAccount.A_zimbraFileDeletionNotificationBody});
		ZaAccount.myXModel.items.push({id:ZaAccount.A_zimbraFileDeletionNotificationSubject, type:_COS_STRING_, ref:"attrs/"+ZaAccount.A_zimbraFileDeletionNotificationSubject});
		ZaAccount.myXModel.items.push({id:ZaAccount.A_zimbraFileVersioningEnabled, type:_COS_ENUM_, ref:"attrs/"+ZaAccount.A_zimbraFileVersioningEnabled,  choices:ZaModel.BOOLEAN_CHOICES});
		ZaAccount.myXModel.items.push({id:ZaAccount.A_zimbraFileVersionLifetime, type:_COS_MLIFETIME_, ref:"attrs/"+ZaAccount.A_zimbraFileVersionLifetime});
		
		//security
		ZaAccount.myXModel.items.push({id:ZaAccount.A_zimbraDeviceAutoLockInteral, type:_COS_MLIFETIME_, ref:"attrs/"+ZaAccount.A_zimbraDeviceAutoLockInteral});

        // feature
        ZaAccount.myXModel.items.push({id:ZaAccount.A_zimbraFeatureCrocodocEnabled, type:_COS_ENUM_, ref:"attrs/" + ZaAccount.A_zimbraFeatureCrocodocEnabled, choices:ZaModel.BOOLEAN_CHOICES});
	}
}

if(ZaCos) {
	ZaCos.A_zimbraFileUploadMaxSizePerFile = "zimbraFileUploadMaxSizePerFile";
	//sharing
	ZaCos.A2_zimbraExternalShareLimitLifetime = "zimbraExternalShareLimitLifetime"; 
	ZaCos.A_zimbraFileExternalShareLifetime = "zimbraFileExternalShareLifetime";
	ZaCos.A2_zimbraInternalShareLimitLifetime = "zimbraInternalShareLimitLifetime";
	ZaCos.A_zimbraFileShareLifetime = "zimbraFileShareLifetime";
	ZaCos.A_zimbraExternalSharingEnabled = "zimbraExternalSharingEnabled";
	ZaCos.A_zimbraExternalShareWhitelistDomain = "zimbraExternalShareWhitelistDomain";
	ZaCos.A_zimbraExternalShareDomainWhitelistEnabled = "zimbraExternalShareDomainWhitelistEnabled";
	
	//retention
	ZaCos.A_zimbraFileExpirationWarningPeriod = "zimbraFileExpirationWarningThreshold";
	ZaCos.A_zimbraFileLifetime = "zimbraFileLifetime";
	ZaCos.A_zimbraFileExpirationWarningBody = "zimbraFileExpirationWarningBody";
	ZaCos.A_zimbraFileExpirationWarningSubject = "zimbraFileExpirationWarningSubject";
	ZaCos.A_zimbraFileDeletionNotificationBody = "zimbraFileDeletionNotificationBody";
	ZaCos.A_zimbraFileDeletionNotificationSubject = "zimbraFileDeletionNotificationSubject";
	ZaCos.A_zimbraFileVersioningEnabled = "zimbraFileVersioningEnabled";
	ZaCos.A_zimbraFileVersionLifetime = "zimbraFileVersionLifetime";
	ZaCos.A_zimbraDeviceAutoLockInteral = "zimbraDeviceAutoLockInteral";

    //feature
    ZaCos.A_zimbraFeatureCrocodocEnabled = "zimbraFeatureCrocodocEnabled";
    ZaCos.A_zimbraFeatureExternalFeedbackEnabled = "zimbraFeatureExternalFeedbackEnabled";
	if(ZaCos.myXModel) {
		ZaCos.myXModel.items.push({id:ZaAccount.A_zimbraFileUploadMaxSizePerFile, type:_NUMBER_, ref:"attrs/"+ZaCos.A_zimbraFileUploadMaxSizePerFile, maxInclusive:2147483648, minInclusive:0});
		ZaCos.myXModel.items.push({id:ZaAccount.A_zimbraPrefFileSharingApplication, type:_ENUM_, ref:"attrs/"+ZaCos.A_zimbraPrefFileSharingApplication, choices:ZaOctopus.fileSharingAppChoices});
        //sharing
		ZaCos.myXModel.items.push({id:ZaCos.A_zimbraFileExternalShareLifetime, type:_MLIFETIME_, ref:"attrs/"+ZaCos.A_zimbraFileExternalShareLifetime});
		ZaCos.myXModel.items.push({id:ZaCos.A2_zimbraExternalShareLimitLifetime, type:_ENUM_, ref:ZaCos.A2_zimbraExternalShareLimitLifetime,  choices:ZaModel.BOOLEAN_CHOICES});
		ZaCos.myXModel.items.push({id:ZaCos.A_zimbraExternalSharingEnabled, type:_ENUM_, ref:"attrs/"+ZaCos.A_zimbraExternalSharingEnabled,  choices:ZaModel.BOOLEAN_CHOICES});
		ZaCos.myXModel.items.push({id:ZaCos.A2_zimbraInternalShareLimitLifetime, type:_ENUM_, ref:ZaCos.A2_zimbraInternalShareLimitLifetime,  choices:ZaModel.BOOLEAN_CHOICES});
		ZaCos.myXModel.items.push({id:ZaCos.A_zimbraFileShareLifetime, type:_MLIFETIME_, ref:"attrs/"+ZaCos.A_zimbraFileShareLifetime});
		ZaCos.myXModel.items.push({id:ZaCos.A_zimbraExternalShareWhitelistDomain, ref:"attrs/" + ZaCos.A_zimbraExternalShareWhitelistDomain, type:_LIST_, itemDelimiter:"\n", dataType:_STRING_,outputType:_STRING_});
		ZaCos.myXModel.items.push({id:ZaCos.A_zimbraExternalShareDomainWhitelistEnabled, type:_ENUM_, ref:"attrs/"+ZaCos.A_zimbraExternalShareDomainWhitelistEnabled,  choices:ZaModel.BOOLEAN_CHOICES});
		
		//retention
		ZaCos.myXModel.items.push({id:ZaCos.A_zimbraFileExpirationWarningPeriod, type:_MLIFETIME_, ref:"attrs/"+ZaCos.A_zimbraFileExpirationWarningPeriod});
		ZaCos.myXModel.items.push({id:ZaCos.A_zimbraFileLifetime, type:_MLIFETIME_, ref:"attrs/"+ZaCos.A_zimbraFileLifetime});
		ZaCos.myXModel.items.push({id:ZaCos.A_zimbraFileExpirationWarningBody, type:_STRING_, ref:"attrs/"+ZaCos.A_zimbraFileExpirationWarningBody});
		ZaCos.myXModel.items.push({id:ZaCos.A_zimbraFileExpirationWarningSubject, type:_STRING_, ref:"attrs/"+ZaCos.A_zimbraFileExpirationWarningSubject});
		ZaCos.myXModel.items.push({id:ZaCos.A_zimbraFileDeletionNotificationBody, type:_STRING_, ref:"attrs/"+ZaCos.A_zimbraFileDeletionNotificationBody});
		ZaCos.myXModel.items.push({id:ZaCos.A_zimbraFileDeletionNotificationSubject, type:_STRING_, ref:"attrs/"+ZaCos.A_zimbraFileDeletionNotificationSubject});
		ZaCos.myXModel.items.push({id:ZaCos.A_zimbraFileVersioningEnabled, type:_ENUM_, ref:"attrs/"+ZaCos.A_zimbraFileVersioningEnabled,  choices:ZaModel.BOOLEAN_CHOICES});
		ZaCos.myXModel.items.push({id:ZaCos.A_zimbraFileVersionLifetime, type:_MLIFETIME_, ref:"attrs/"+ZaCos.A_zimbraFileVersionLifetime});
		
		//security
		ZaCos.myXModel.items.push({id:ZaCos.A_zimbraDeviceAutoLockInteral, type:_MLIFETIME_, ref:"attrs/"+ZaCos.A_zimbraDeviceAutoLockInteral});

        // feature
        ZaCos.myXModel.items.push({id:ZaCos.A_zimbraFeatureCrocodocEnabled, choices:ZaModel.BOOLEAN_CHOICES, ref:"attrs/"+ZaCos.A_zimbraFeatureCrocodocEnabled, type:_ENUM_});
        ZaCos.myXModel.items.push({id:ZaCos.A_zimbraFeatureExternalFeedbackEnabled , choices:ZaModel.BOOLEAN_CHOICES, ref:"attrs/"+ZaCos.A_zimbraFeatureExternalFeedbackEnabled, type:_ENUM_});

	}
	
}

if (ZaGlobalConfig) {
    ZaGlobalConfig.A_zimbraShareNotificationMtaEnabled = "zimbraShareNotificationMtaEnabled";
    ZaGlobalConfig.A_zimbraShareNotificationMtaHostname = "zimbraShareNotificationMtaHostname";
    ZaGlobalConfig.A_zimbraShareNotificationMtaPort = "zimbraShareNotificationMtaPort";
    ZaGlobalConfig.A_zimbraShareNotificationMtaAuthAccount = "zimbraShareNotificationMtaAuthAccount";
    ZaGlobalConfig.A_zimbraShareNotificationMtaAuthPassword = "zimbraShareNotificationMtaAuthPassword";
    ZaGlobalConfig.A_zimbraShareNotificationMtaConnectionType = "zimbraShareNotificationMtaConnectionType";
    ZaGlobalConfig.A_zimbraShareNotificationMtaAuthRequired = "zimbraShareNotificationMtaAuthRequired";

    ZaGlobalConfig.myXModel.items.push({ id:ZaGlobalConfig.A_zimbraShareNotificationMtaEnabled, ref:"attrs/" + ZaGlobalConfig.A_zimbraShareNotificationMtaEnabled, type:_ENUM_, choices:ZaModel.BOOLEAN_CHOICES});
    ZaGlobalConfig.myXModel.items.push({ id:ZaGlobalConfig.A_zimbraShareNotificationMtaHostname, ref:"attrs/" + ZaGlobalConfig.A_zimbraShareNotificationMtaHostname, type:_STRING_, maxLength:128 });
    ZaGlobalConfig.myXModel.items.push({ id:ZaGlobalConfig.A_zimbraShareNotificationMtaPort, ref:"attrs/" + ZaGlobalConfig.A_zimbraShareNotificationMtaPort, type:_PORT_});
    ZaGlobalConfig.myXModel.items.push({ id:ZaGlobalConfig.A_zimbraShareNotificationMtaAuthAccount, ref:"attrs/" + ZaGlobalConfig.A_zimbraShareNotificationMtaAuthAccount, type:_STRING_, maxLength:128 });
    ZaGlobalConfig.myXModel.items.push({ id:ZaGlobalConfig.A_zimbraShareNotificationMtaAuthPassword, ref:"attrs/" + ZaGlobalConfig.A_zimbraShareNotificationMtaAuthPassword, type:_STRING_, maxLength:64 });
    ZaGlobalConfig.myXModel.items.push({ id:ZaGlobalConfig.A_zimbraShareNotificationMtaAuthRequired, ref:"attrs/" + ZaGlobalConfig.A_zimbraShareNotificationMtaAuthRequired, type:_ENUM_, choices:ZaModel.BOOLEAN_CHOICES});
    ZaGlobalConfig.myXModel.items.push({ id:ZaGlobalConfig.A_zimbraShareNotificationMtaConnectionType, ref:"attrs/" + ZaGlobalConfig.A_zimbraShareNotificationMtaConnectionType, type:_STRING_});
}

if (ZaServer) {
    ZaServer.A_zimbraShareNotificationMtaEnabled = "zimbraShareNotificationMtaEnabled";
    ZaServer.A_zimbraShareNotificationMtaHostname = "zimbraShareNotificationMtaHostname";
    ZaServer.A_zimbraShareNotificationMtaPort = "zimbraShareNotificationMtaPort";
    ZaServer.A_zimbraShareNotificationMtaAuthAccount = "zimbraShareNotificationMtaAuthAccount";
    ZaServer.A_zimbraShareNotificationMtaAuthPassword = "zimbraShareNotificationMtaAuthPassword";
    ZaServer.A_zimbraShareNotificationMtaConnectionType = "zimbraShareNotificationMtaConnectionType";
    ZaServer.A_zimbraShareNotificationMtaAuthRequired = "zimbraShareNotificationMtaAuthRequired";

    ZaServer.myXModel.items.push({ id:ZaServer.A_zimbraShareNotificationMtaEnabled, ref:"attrs/" + ZaServer.A_zimbraShareNotificationMtaEnabled, type:_COS_ENUM_, choices:ZaModel.BOOLEAN_CHOICES});
    ZaServer.myXModel.items.push({ id:ZaServer.A_zimbraShareNotificationMtaHostname, ref:"attrs/" + ZaServer.A_zimbraShareNotificationMtaHostname, type:_COS_STRING_, maxLength:128 });
    ZaServer.myXModel.items.push({ id:ZaServer.A_zimbraShareNotificationMtaPort, ref:"attrs/" + ZaServer.A_zimbraShareNotificationMtaPort, type:_COS_PORT_});
    ZaServer.myXModel.items.push({ id:ZaServer.A_zimbraShareNotificationMtaAuthAccount, ref:"attrs/" + ZaServer.A_zimbraShareNotificationMtaAuthAccount, type:_COS_STRING_, maxLength:128 });
    ZaServer.myXModel.items.push({ id:ZaServer.A_zimbraShareNotificationMtaAuthPassword, ref:"attrs/" + ZaServer.A_zimbraShareNotificationMtaAuthPassword, type:_COS_STRING_, maxLength:64 });
    ZaServer.myXModel.items.push({ id:ZaServer.A_zimbraShareNotificationMtaAuthRequired, ref:"attrs/" + ZaServer.A_zimbraShareNotificationMtaAuthRequired, type:_COS_ENUM_, choices:ZaModel.BOOLEAN_CHOICES});
    ZaServer.myXModel.items.push({ id:ZaServer.A_zimbraShareNotificationMtaConnectionType, ref:"attrs/" + ZaServer.A_zimbraShareNotificationMtaConnectionType, type:_COS_STRING_});
}

ZaOctopus.isWipeButtonEnabled = function () {
	var selArr = this.getInstanceValue(ZaOctopus.A2_device_selection_cache);
	return (!AjxUtil.isEmpty(selArr) 
			&& selArr.length==1
			&& selArr[0][ZaOctopus.deviceStatus] != ZaOctopus.deviceDisabled);
}

ZaOctopus.deviceListSelectionListener = function() {
	var arr = this.widget.getSelection();
	if(arr && arr.length) {
		this.getModel().setInstanceValue(this.getInstance(), ZaOctopus.A2_device_selection_cache, arr);
	} else {
		this.getModel().setInstanceValue(this.getInstance(), ZaOctopus.A2_device_selection_cache, null);
	}	
}

ZaOctopus.wipeButtonListener = function () {
	var instance = this.getInstance();
	
	var selArr = this.getInstanceValue(ZaOctopus.A2_device_selection_cache);
	if(AjxUtil.isEmpty(selArr)) {
		return;
	}
	var callback = new AjxCallback(this,ZaOctopus.deviceWipeCallback,[selArr[0][ZaOctopus.deviceName]]);
	ZaApp.getInstance().dialogs["confirmMessageDialog"] = new ZaMsgDialog(ZaApp.getInstance().getAppCtxt().getShell(), null, [DwtDialog.YES_BUTTON, DwtDialog.NO_BUTTON]);
	ZaApp.getInstance().dialogs["confirmMessageDialog"].setMessage(AjxMessageFormat.format(com_zimbra_octopus.Q_WIPE_DEVICE,[selArr[0][ZaOctopus.deviceName]]),  DwtMessageDialog.WARNING_STYLE);
	ZaApp.getInstance().dialogs["confirmMessageDialog"].registerCallback(DwtDialog.YES_BUTTON, ZaOctopus.updateDeviceStatus, this, [this.getInstance(), selArr[0][ZaOctopus.deviceID],ZaOctopus.deviceDisabled,callback]);
	ZaApp.getInstance().dialogs["confirmMessageDialog"].popup();		

}

if(ZaTabView.ObjectModifiers["ZaAccountXFormView"]) {
    ZaOctopus.AccountObjectModifier = function () {
        var defaultShareLife;

        if (this._containedObject._defaultValues) {
            defaultShareLife = this._containedObject._defaultValues.attrs[ZaAccount.A_zimbraFileExternalShareLifetime];
        }
        if (defaultShareLife && (parseInt(defaultShareLife) != 0)) {
            this._containedObject._defaultValues[ZaAccount.A2_zimbraExternalShareLimitLifetime] = "TRUE";
        }  else {
            this._containedObject._defaultValues[ZaAccount.A2_zimbraExternalShareLimitLifetime] = "FALSE";
        }

        var shareLife = this._containedObject.attrs[ZaAccount.A_zimbraFileExternalShareLifetime];
        if (shareLife) {
            if (parseInt(shareLife) != 0) {
                this._containedObject[ZaAccount.A2_zimbraExternalShareLimitLifetime] = "TRUE";
            } else {
                this._containedObject[ZaAccount.A2_zimbraExternalShareLimitLifetime] = "FALSE";
            }

        }
        defaultShareLife = null;
        if (this._containedObject._defaultValues) {
            defaultShareLife = this._containedObject._defaultValues.attrs[ZaAccount.A_zimbraFileShareLifetime];
        }
        if (defaultShareLife && (parseInt(defaultShareLife) != 0)) {
            this._containedObject._defaultValues[ZaAccount.A2_zimbraInternalShareLimitLifetime] = "TRUE";
        }  else {
            this._containedObject._defaultValues[ZaAccount.A2_zimbraInternalShareLimitLifetime] = "FALSE";
        }

        var shareLife = this._containedObject.attrs[ZaAccount.A_zimbraFileShareLifetime];
        if (shareLife) {
            if (parseInt(shareLife) != 0) {
                this._containedObject[ZaAccount.A2_zimbraInternalShareLimitLifetime] = "TRUE";
            } else {
                this._containedObject[ZaAccount.A2_zimbraInternalShareLimitLifetime] = "FALSE";
            }

        }
    }
    ZaTabView.ObjectModifiers["ZaAccountXFormView"].push(ZaOctopus.AccountObjectModifier);
}

if(ZaTabView.ObjectModifiers["ZaCosXFormView"]) {
    ZaOctopus.CosObjectModifier = function () {
        var shareLifeTime;
        if (!this._containedObject.attrs[ZaCos.A_zimbraFileExternalShareLifetime]) {
            shareLifeTime = "FALSE";
        }  else {
            if (parseInt(this._containedObject.attrs[ZaCos.A_zimbraFileExternalShareLifetime]) == 0 ) {
                shareLifeTime = "FALSE";
            } else {
                shareLifeTime = "TRUE";
            }
        }
        this._containedObject[ZaCos.A2_zimbraExternalShareLimitLifetime] =  shareLifeTime;
        
        shareLifeTime = null;
        if (!this._containedObject.attrs[ZaCos.A_zimbraFileShareLifetime]) {
            shareLifeTime = "FALSE";
        }  else {
            if (parseInt(this._containedObject.attrs[ZaCos.A_zimbraFileShareLifetime]) == 0 ) {
                shareLifeTime = "FALSE";
            } else {
                shareLifeTime = "TRUE";
            }
        }
        this._containedObject[ZaCos.A2_zimbraInternalShareLimitLifetime] =  shareLifeTime;
    }
    ZaTabView.ObjectModifiers["ZaCosXFormView"].push(ZaOctopus.CosObjectModifier);
}

if(ZaTabView.XFormModifiers["ZaCosXFormView"]) {
	ZaOctopus.COSXFormModifier = function(xFormObject,entry) {
		var cnt = xFormObject.items.length;
		var switchObj = null;
		for(var i = 0; i <cnt; i++) {
			if(xFormObject.items[i].type=="switch") {
				switchObj = xFormObject.items[i];
				break;				
			}
		}
		cnt = switchObj.items.length;
		for(var i = 0; i <cnt; i++) {
			if(switchObj.items[i].id=="cos_form_features_tab") {
				var tmpItems = switchObj.items[i].items;
				var cnt2 = tmpItems.length;
				for(var j=0; j<cnt2; j++) {
                    if(tmpItems[j].id=="cos_form_features_general" && tmpItems[j].items) {
                        tmpItems[j].visibilityChecks[0][1].push(ZaCos.A_zimbraFeatureCrocodocEnabled);
                        tmpItems[j].visibilityChecks[0][1].push(ZaCos.A_zimbraFeatureExternalFeedbackEnabled);
						var genernalFeatureItems = tmpItems[j].items;
                        ZaCosXFormView.FEATURE_TAB_ATTRS.push(ZaCos.A_zimbraFeatureCrocodocEnabled);
                        ZaCosXFormView.FEATURE_TAB_ATTRS.push(ZaCos.A_zimbraFeatureExternalFeedbackEnabled);
						genernalFeatureItems.push({
                            ref:ZaCos.A_zimbraFeatureCrocodocEnabled,
                            type:_CHECKBOX_, msgName:com_zimbra_octopus.LBL_zimbraFeatureCrocodocrEnabled,
                            label:com_zimbra_octopus.LBL_zimbraFeatureCrocodocrEnabled,
                            trueValue:"TRUE", falseValue:"FALSE"}
                        );
                        genernalFeatureItems.push({
                            ref:ZaCos.A_zimbraFeatureExternalFeedbackEnabled,
                            type:_CHECKBOX_, msgName:com_zimbra_octopus.LBL_zimbraFeatureExternalFeedbackEnabled,
                            label:com_zimbra_octopus.LBL_zimbraFeatureExternalFeedbackEnabled,
                            trueValue:"TRUE", falseValue:"FALSE"}
                        );
						break;
					}
				}
			} else if (switchObj.items[i].id=="cos_form_advanced_tab") {
				var tmpItems = switchObj.items[i].items;
				var cnt2 = tmpItems.length;
				for(var j=0;j<cnt2;j++) {
					if(tmpItems[j].id == "cos_timeout_settings") {
						tmpItems[j].items.push({ref:ZaCos.A_zimbraDeviceAutoLockInteral, type:_LIFETIME_MINUTES_,
							visibilityChecks:[],enableDisableChecks:[],
							msgName:com_zimbra_octopus.MSG_zimbraDeviceAutoLockInteral,
							label:com_zimbra_octopus.LBL_zimbraDeviceAutoLockInteral,labelLocation:_LEFT_});
					}
					if(tmpItems[j].id == "cos_quota_settings") {
						tmpItems[j].items.push({ref:ZaCos.A_zimbraFileUploadMaxSizePerFile, type:_TEXTFIELD_,
							msgName:com_zimbra_octopus.MSG_zimbraFileUploadMaxSizePerFile,
							textFieldCssClass:"admin_xform_number_input",
							label:com_zimbra_octopus.LBL_zimbraFileUploadMaxSizePerFile,labelLocation:_LEFT_});
					}
				}
			}
		}
		
		var tabBarChoices = xFormObject.items[1].choices;
		var tabCases = xFormObject.items[2].items;

		ZaCosXFormView.EXTERNAL_SHARING_TAB_ATTRS = [ZaCos.A_zimbraFileExternalShareLifetime,ZaCos.A_zimbraExternalShareDomainWhitelistEnabled];
		ZaCosXFormView.EXTERNAL_SHARING_TAB_RIGHTS = [];
		var externalShareTab = 0;
		
		if(ZaTabView.isTAB_ENABLED(entry,ZaCosXFormView.EXTERNAL_SHARING_TAB_ATTRS, ZaCosXFormView.EXTERNAL_SHARING_TAB_RIGHTS)) {
			externalShareTab = ++this.TAB_INDEX;
	    	tabBarChoices.push({value:externalShareTab, label:com_zimbra_octopus.TABT_Sharing});
	    }
	    
		if(externalShareTab) {
        	var case9 = {type:_ZATABCASE_, colSizes:["auto"],numCols:1, caseKey:externalShareTab, id:"cos_form_external_sharing_tab"};
        	var case9Items = [
        	    {type:_ZA_TOP_GROUPER_, id:"cos_external_sharing_expiration_settings", colSizes:["50px","auto"],
        	    	label:com_zimbra_octopus.NAD_ExternalShareExpirationGrouper,
        	    	items:[
        	    	       {ref:ZaCos.A_zimbraExternalSharingEnabled, 
        	    	    	   type:_CHECKBOX_,subLabel:null,
        	    	    	   label:com_zimbra_octopus.AllowExternalSharing,
        	    	    	   labelLocation:_RIGHT_, trueValue:"TRUE", falseValue:"FALSE",
        	    	    	   align:_RIGHT_
        	    	       },
        	    	       {type:_GROUP_,
        	    	    	   visibilityChecks:[[XFormItem.prototype.hasReadPermission,ZaCos.A_zimbraFileExternalShareLifetime]],
        	    	    	   visibilityChangeEventSources:[ZaCos.A_zimbraFileExternalShareLifetime],
        	    	    	   colSpan:2,numCols:5,colSizes:["50px", "auto","5px", "auto", "auto"],
        	    	           items:[
									{ref:ZaCos.A2_zimbraExternalShareLimitLifetime, 
										type:_CHECKBOX_,subLabel:null,align:_RIGHT_,
										label:com_zimbra_octopus.LimitExternalShareLifetime,
										labelLocation:_RIGHT_, trueValue:"TRUE", falseValue:"FALSE",
									    enableDisableChangeEventSources:[ZaCos.A_zimbraExternalSharingEnabled],
									    enableDisableChecks:[[XForm.checkInstanceValue,ZaCos.A_zimbraExternalSharingEnabled,"TRUE"]],
                                        elementChanged: function(elementValue,instanceValue, event) {
                                            if(elementValue != "TRUE") {
                                                this.setInstanceValue("0d", ZaCos.A_zimbraFileExternalShareLifetime);
                                            }
                                            this.getForm().itemChanged(this, elementValue, event);
                                        },
									    visibilityChecks:[]
									},
									{type:_CELLSPACER_, height:"100%"},
									{ref:ZaCos.A_zimbraFileExternalShareLifetime, type:_LIFETIME_,
			                               label:null, labelLocation:_NONE_,  bmolsnr: true,
			                               labelCssStyle:"white-space:normal;",nowrap:false,labelWrap:true,
			                               enableDisableChangeEventSources:[ZaCos.A2_zimbraExternalShareLimitLifetime,ZaCos.A_zimbraExternalSharingEnabled],
			                               enableDisableChecks:[[XForm.checkInstanceValue,ZaCos.A2_zimbraExternalShareLimitLifetime,"TRUE"],[XForm.checkInstanceValue,ZaCos.A_zimbraExternalSharingEnabled,"TRUE"]]
			                        }   
        	    	           ]                                   
        	    	       }
        	    	]
        	    },
        	    {type:_ZA_TOP_GROUPER_, id:"cos_external_sharing_domain_settings", colSizes:["50px","300px"],numCols:2, width:"350px",
        	    	label:com_zimbra_octopus.ExternalShareDomainPolicyGrouper,
        	    	items:[
						{ref:ZaCos.A_zimbraExternalShareDomainWhitelistEnabled, 
							type:_CHECKBOX_,subLabel:null,
							label:com_zimbra_octopus.LBL_ExternalShareDomainWhitelist,
							labelLocation:_RIGHT_, trueValue:"TRUE", falseValue:"FALSE",
							visibilityChecks:[],align:_RIGHT_,
						    enableDisableChangeEventSources:[ZaCos.A_zimbraExternalSharingEnabled],
						    enableDisableChecks:[[XForm.checkInstanceValue,ZaCos.A_zimbraExternalSharingEnabled,"TRUE"]]						 						   
						},
						{type:_CELLSPACER_, height:"100%"},
				      	{type:_TEXTAREA_, ref:ZaCos.A_zimbraExternalShareWhitelistDomain, 
				      		label:null,
							enableDisableChecks:[[XForm.checkInstanceValue,ZaCos.A_zimbraExternalShareDomainWhitelistEnabled,"TRUE"],
							                     [XForm.checkInstanceValue,ZaCos.A_zimbraExternalSharingEnabled,"TRUE"]],
							enableDisableChangeEventSources:[ZaCos.A_zimbraExternalSharingEnabled,
							                                 ZaCos.A_zimbraExternalShareDomainWhitelistEnabled]
				      	}
        	    	]
        	    },
        	    {type:_ZA_TOP_GROUPER_, id:"cos_internal_sharing_expiration_settings", colSizes:["50px","auto"],
        	    	label:com_zimbra_octopus.NAD_InternalShareExpirationGrouper,
        	    	items:[
        	    	       {type:_GROUP_,
        	    	    	   visibilityChecks:[[XFormItem.prototype.hasReadPermission,ZaCos.A_zimbraFileShareLifetime]],
        	    	    	   visibilityChangeEventSources:[ZaCos.A_zimbraFileShareLifetime],
        	    	    	   colSpan:2,numCols:5,colSizes:["50px", "auto","5px", "auto", "auto"],
        	    	           items:[
									{ref:ZaCos.A2_zimbraInternalShareLimitLifetime, 
										type:_CHECKBOX_,subLabel:null,align:_RIGHT_,
										label:com_zimbra_octopus.LimitInternalShareLifetime,
										labelLocation:_RIGHT_, trueValue:"TRUE", falseValue:"FALSE",
									    enableDisableChangeEventSources:[],
									    enableDisableChecks:[],
                                        elementChanged: function(elementValue,instanceValue, event) {
                                            if(elementValue != "TRUE") {
                                                this.setInstanceValue("0d", ZaCos.A_zimbraFileShareLifetime);
                                            }
                                            this.getForm().itemChanged(this, elementValue, event);
                                        },
									    visibilityChecks:[]
									},
									{type:_CELLSPACER_, height:"100%"},
									{ref:ZaCos.A_zimbraFileShareLifetime, type:_LIFETIME_,
			                               label:null, labelLocation:_NONE_,  bmolsnr: true,
			                               labelCssStyle:"white-space:normal;",nowrap:false,labelWrap:true,
			                               enableDisableChangeEventSources:[ZaCos.A2_zimbraInternalShareLimitLifetime],
			                               enableDisableChecks:[[XForm.checkInstanceValue,ZaCos.A2_zimbraInternalShareLimitLifetime,"TRUE"]]
			                        }   
        	    	           ]                                   
        	    	       }
        	    	]
        	    }

        	];
            case9.items = case9Items;
            tabCases.push(case9);   
        }
		
        //retention
        /*
		ZaCosXFormView.FILE_RETENTION_TAB_ATTRS = [ZaCos.A_zimbraFileExpirationWarningPeriod,ZaCos.A_zimbraFileExpirationWarningPeriod,
		                                           ZaCos.A_zimbraFileDeletionNotificationSubject,ZaCos.A_zimbraFileDeletionNotificationBody,
		                                           ZaCos.A_zimbraFileExpirationWarningSubject,ZaCos.A_zimbraFileExpirationWarningBody];
		ZaCosXFormView.FILE_RETENTION_TAB_RIGHTS = [];
		var fileRetentionTab = 0;
		
		if(ZaTabView.isTAB_ENABLED(entry,ZaCosXFormView.FILE_RETENTION_TAB_ATTRS, ZaCosXFormView.FILE_RETENTION_TAB_RIGHTS)) {
			fileRetentionTab = ++this.TAB_INDEX;
	    	tabBarChoices.push({value:fileRetentionTab, label:com_zimbra_octopus.TABT_FileRetention});
	    }
		
		if(fileRetentionTab) {
			var case10 = {type:_ZATABCASE_, caseKey:fileRetentionTab, id:"cos_file_retention_sharing_tab",numCols:1,colSizes:["*"]};
			var case10items = [
               	{type:_ZA_TOP_GROUPER_, 
               		label:com_zimbra_octopus.LBL_Thresholds,  
					items: [	
		               {ref:ZaCos.A_zimbraFileLifetime, type:_LIFETIME2_, 
		            	   msgName:com_zimbra_octopus.MSG_zimbraFileLifetime,
		            	   label:com_zimbra_octopus.LBL_zimbraFileLifetime,
		            	   labelLocation:_LEFT_
		               },
		               {ref:ZaCos.A_zimbraFileExpirationWarningPeriod, type:_LIFETIME2_, 
		            	   msgName:com_zimbra_octopus.MSG_zimbraFileExpirationWarningPeriod,
		            	   label:com_zimbra_octopus.LBL_zimbraFileExpirationWarningPeriod,
		            	   labelLocation:_LEFT_
		               },
		               {type:_GROUP_,
    	    	    	   colSpan:2,numCols:3,colSizes:["275px", "55px","auto"],//numCols:5,colSizes:["50px", "auto","5px", "auto", "auto"],
    	    	           items:[
    	    	                {type:_GROUP_, cssStyle:"text-align:right;float:right;padding-right:5px",items:[ 
									{ref:ZaCos.A_zimbraFileVersioningEnabled, subLabel:null,
										type:_CHECKBOX_,msgName:com_zimbra_octopus.MSG_zimbraFileVersioningEnabled,
										label:com_zimbra_octopus.LBL_zimbraFileVersioningEnabled,
										labelLocation:_RIGHT_, trueValue:"TRUE", falseValue:"FALSE"
									}],useParentTable:false
     	    	                },
								{ref:ZaCos.A_zimbraFileVersionLifetime, type:_LIFETIME2_,
	                               label:null, labelLocation:_NONE_,
	                               labelCssStyle:"white-space:normal;",nowrap:false,labelWrap:true,
	                               enableDisableChangeEventSources:[ZaCos.A_zimbraFileVersioningEnabled],
	                               enableDisableChecks:[[XForm.checkInstanceValue,ZaCos.A_zimbraFileVersioningEnabled,"TRUE"]]
		                        }   
    	    	           ]                                   
    	    	       }
		           ]},
	               {type:_ZA_TOP_GROUPER_, 
					label:com_zimbra_octopus.LBL_Emailtemplates,  
	           		items: [
		               {ref:ZaCos.A_zimbraFileDeletionNotificationSubject, type:_TEXTFIELD_, cssClass:"admin_xform_name_input",
		                   msgName:com_zimbra_octopus.LBL_zimbraFileDeletionNotificationSubject,
		                   label:com_zimbra_octopus.LBL_zimbraFileDeletionNotificationSubject,
		                   labelLocation:_LEFT_
		               },
		               {type:_TEXTAREA_, ref:ZaCos.A_zimbraFileDeletionNotificationBody, 
				      		label:com_zimbra_octopus.LBL_zimbraFileDeletionNotificationBody,
				      		msgName:com_zimbra_octopus.MSG_zimbraFileDeletionNotificationBody,
				      		labelLocation:_LEFT_
				       },
				       {ref:ZaCos.A_zimbraFileExpirationWarningSubject, type:_TEXTFIELD_, cssClass:"admin_xform_name_input",
		                   msgName:com_zimbra_octopus.LBL_zimbraFileExpirationWarningSubject,
		                   label:com_zimbra_octopus.LBL_zimbraFileExpirationWarningSubject,
		                   labelLocation:_LEFT_
		               },
		               {type:_TEXTAREA_, ref:ZaCos.A_zimbraFileExpirationWarningBody, 
				      		label:com_zimbra_octopus.LBL_zimbraFileExpirationWarningBody,
				      		msgName:com_zimbra_octopus.MSG_zimbraFileExpirationWarningBody,
				      		labelLocation:_LEFT_
				       }
		               ]
	               }
	         ];
			case10.items=case10items;
			tabCases.push(case10);
		}*/
		
	}
	
	
	ZaTabView.XFormModifiers["ZaCosXFormView"].push(ZaOctopus.COSXFormModifier);
}

if(ZaXDialog.XFormModifiers["ZaNewCosXWizard"]) {
	ZaOctopus.NewCOSXWizardModifier = function(xFormObject,entry) {
		var cnt = xFormObject.items.length;
		var switchObj = null;
		for(var i = 0; i <cnt; i++) {
			if(xFormObject.items[i].type=="switch") {
				switchObj = xFormObject.items[i];
				break;
			}
		}
		cnt = switchObj.items.length;
		for(var i = 0; i <cnt; i++) {
			if(switchObj.items[i].id=="cos_form_features_tab") {
				var tmpItems = switchObj.items[i].items;
				var cnt2 = tmpItems.length;
				for(var j=0; j<cnt2; j++) {
                    if(tmpItems[j].id=="cos_form_features_general" && tmpItems[j].items) {
                        tmpItems[j].visibilityChecks[0][1].push(ZaCos.A_zimbraFeatureCrocodocEnabled);
                        tmpItems[j].visibilityChecks[0][1].push(ZaCos.A_zimbraFeatureExternalFeedbackEnabled);
						var genernalFeatureItems = tmpItems[j].items;
                        ZaNewCosXWizard.FEATURE_TAB_ATTRS.push(ZaCos.A_zimbraFeatureCrocodocEnabled);
                        ZaNewCosXWizard.FEATURE_TAB_ATTRS.push(ZaCos.A_zimbraFeatureExternalFeedbackEnabled);
						genernalFeatureItems.push({
                            ref:ZaCos.A_zimbraFeatureCrocodocEnabled,
                            type:_WIZ_CHECKBOX_, msgName:com_zimbra_octopus.LBL_zimbraFeatureCrocodocrEnabled,
                            label:com_zimbra_octopus.LBL_zimbraFeatureCrocodocrEnabled,
                            trueValue:"TRUE", falseValue:"FALSE"}
                        );
                        genernalFeatureItems.push({
                            ref:ZaCos.A_zimbraFeatureExternalFeedbackEnabled,
                            type:_WIZ_CHECKBOX_, msgName:com_zimbra_octopus.LBL_zimbraFeatureExternalFeedbackEnabled,
                            label:com_zimbra_octopus.LBL_zimbraFeatureExternalFeedbackEnabled,
                            trueValue:"TRUE", falseValue:"FALSE"}
                        );
						break;
					}
				}
			}
		}
	}
	ZaXDialog.XFormModifiers["ZaNewCosXWizard"].push(ZaOctopus.NewCOSXWizardModifier);
}

if(ZaTabView.XFormModifiers["ZaAccountXFormView"]) {
	
	ZaOctopus.AccountXFormModifier = function(xFormObject,entry) {
		if(entry.attrs[ZaAccount.A_zimbraIsExternalVirtualAccount] == "TRUE") {
			return;
		}
		var cnt = xFormObject.items.length;
		var switchObj = null;
		for(var i = 0; i <cnt; i++) {
			if(xFormObject.items[i].type=="switch")  {
				switchObj = xFormObject.items[i]; 
				break;
			}
		}
		cnt = switchObj.items.length;
		for(var i = 0; i <cnt; i++) {
			if(switchObj.items[i].id=="account_form_features_tab") {
				var tmpItems = switchObj.items[i].items;
				var cnt2 = tmpItems.length;
				for(var k=0; k<cnt2; k++) {
                    /*
					if(tmpItems[k].id=="account_form_features_major" && tmpItems[k].items) {
						var majorFeatureItems = tmpItems[k].items;
						for(var l=0;l<majorFeatureItems.length;l++) {
							if(majorFeatureItems[l].ref == ZaAccount.A_zimbraFeatureBriefcasesEnabled) {
								//add filesharing dropdown 
								majorFeatureItems.splice(l+1,0,
										{ref:ZaAccount.A_zimbraPrefFileSharingApplication,choices:ZaOctopus.fileSharingAppChoices,
											type:_SUPER_SELECT1_,resetToSuperLabel:ZaMsg.NAD_ResetToCOS,
											label:com_zimbra_octopus.LBL_zimbraPrefFileSharingApplication,labelLocation:_LEFT_,
											enableDisableChecks:[[ZaItem.hasWritePermission,ZaAccount.A_zimbraPrefFileSharingApplication]],
											enableDisableChangeEventSources:[ZaAccount.A_zimbraFeatureBriefcasesEnabled]
										}		
								);
								break;
							}
						}
						break;
					} */
                    if(tmpItems[k].id=="account_form_features_general" && tmpItems[k].items) {
                        ZaAccountXFormView.FEATURE_TAB_ATTRS.push(ZaAccount.A_zimbraFeatureCrocodocEnabled);
                        tmpItems[k].visibilityChecks[0][1].push(ZaCos.A_zimbraFeatureCrocodocEnabled);
                        tmpItems[k].items.push(
                            {ref:ZaAccount.A_zimbraFeatureCrocodocEnabled,
                                type:_SUPER_CHECKBOX_, resetToSuperLabel:ZaMsg.NAD_ResetToCOS,
                                msgName:com_zimbra_octopus.LBL_zimbraFeatureCrocodocrEnabled,checkBoxLabel:com_zimbra_octopus.LBL_zimbraFeatureCrocodocrEnabled,
                                trueValue:"TRUE", falseValue:"FALSE"
                            }
                        );
                    }
				}
			} else if (switchObj.items[i].id=="account_form_advanced_tab") {
				var tmpItems = switchObj.items[i].items;
				var cnt2 = tmpItems.length;
				for(var j=0;j<cnt2;j++) {
					if(tmpItems[j].id == "timeout_settings") {
						tmpItems[j].items.push({ref:ZaAccount.A_zimbraDeviceAutoLockInteral, type:_SUPER_LIFETIME_MINUTES_,
							resetToSuperLabel:ZaMsg.NAD_ResetToCOS,
							visibilityChecks:[],enableDisableChecks:[],
							msgName:com_zimbra_octopus.MSG_zimbraDeviceAutoLockInteral,
							colSpan:1, colSizes:["275px", "65px'", "210px", "*"],
							txtBoxLabel:com_zimbra_octopus.LBL_zimbraDeviceAutoLockInteral,labelLocation:_LEFT_});
					}
					if(tmpItems[j].id == "account_quota_settings") {
						tmpItems[j].items.splice(0,0,
								{ref:ZaAccount.A_zimbraFileUploadMaxSizePerFile, type:_SUPER_TEXTFIELD_,
									resetToSuperLabel:ZaMsg.NAD_ResetToCOS,
									msgName:com_zimbra_octopus.MSG_zimbraFileUploadMaxSizePerFile,
									textFieldCssClass:"admin_xform_number_input",
									colSpan:1,
									txtBoxLabel:com_zimbra_octopus.LBL_zimbraFileUploadMaxSizePerFile,
									labelLocation:_LEFT_}
						);
					}
				}
			}
		}
		var tabCases = xFormObject.items[2].items;
		var tabBarChoices = xFormObject.items[1].choices;
		
		var deviceHeaderList = new Array();
		deviceHeaderList[0] = new ZaListHeaderItem(ZaOctopus.deviceName, com_zimbra_octopus.deviceName, null, "200px", null, null, false, true);
		deviceHeaderList[1] = new ZaListHeaderItem(ZaOctopus.deviceStatus, com_zimbra_octopus.deviceStatus, null, "200px", null, null, false, true);
		deviceHeaderList[2] = new ZaListHeaderItem(ZaOctopus.deviceCreated, com_zimbra_octopus.deviceCreated, null, "200px", null, null, false, true);
		deviceHeaderList[3] = new ZaListHeaderItem(ZaOctopus.deviceAccessed, com_zimbra_octopus.deviceAccessed, null, "auto", null, null, false, true);

		var devicesTab = ++this.TAB_INDEX;
		var case1 = {type:_ZATABCASE_, caseKey:devicesTab, colSizes:["auto"],numCols:1, 
				items:[
					{ref:ZaAccount.A_octopusDevices, type:_DWT_LIST_, height:"150px", width:"90%",
					 	preserveSelection:false, multiselect:false,cssClass: "DLSource",
					 	headerList:deviceHeaderList, widgetClass:OctopusDeviceListView,
					 	visibilityChecks:[],enableDisableChecks:[],
					 	onSelection:ZaOctopus.deviceListSelectionListener,bmolsnr:true
					},
					{type:_GROUP_, numCols:2, colSizes:["100px","auto"/*,"180px","auto","180px"*/], width:"550px",
						cssStyle:"margin-bottom:10px;padding-bottom:0px;margin-top:10px;pxmargin-left:10px;margin-right:10px;",
						items: [
							{type:_DWT_BUTTON_, label:com_zimbra_octopus.WipeBtn,width:"80px",
								onActivate:"ZaOctopus.wipeButtonListener.call(this);",
								enableDisableChecks:[ZaOctopus.isWipeButtonEnabled],
	                            enableDisableChangeEventSources:[ZaOctopus.A2_device_selection_cache],
	                            visibilityChecks:[]
							},
							{type:_CELLSPACER_}
						]
					}					
        ]};
		
		tabCases.push(case1);
		
		tabBarChoices.push({value:devicesTab,label:com_zimbra_octopus.Devices});
		
		ZaAccountXFormView.EXTERNAL_SHARING_TAB_ATTRS = [ZaAccount.A_zimbraFileExternalShareLifetime,ZaAccount.A_zimbraExternalShareDomainWhitelistEnabled];
		ZaAccountXFormView.EXTERNAL_SHARING_TAB_RIGHTS = [];
		var externalShareTab = 0;
		
		if(ZaTabView.isTAB_ENABLED(entry,ZaAccountXFormView.EXTERNAL_SHARING_TAB_ATTRS, ZaAccountXFormView.EXTERNAL_SHARING_TAB_RIGHTS)) {
			externalShareTab = ++this.TAB_INDEX;
	    	tabBarChoices.push({value:externalShareTab, label:com_zimbra_octopus.TABT_Sharing});
	    }
	    
		if(externalShareTab) {
        	var case2 = {type:_ZATABCASE_, colSizes:["auto"],numCols:1,caseKey:externalShareTab, id:"account_form_external_sharing_tab"};
        	var case2Items = [
        	    {type:_ZA_TOP_GROUPER_, id:"account_external_sharing_expiration_settings", colSizes:["auto"],numCols:1,
        	    	label:com_zimbra_octopus.NAD_ExternalShareExpirationGrouper,
        	    	items:[
        	    	       {ref:ZaAccount.A_zimbraExternalSharingEnabled, 
        	    	    	   type:_SUPER_CHECKBOX_,checkboxSubLabel:null,
        	    	    	   colSizes:["275px","245px", "*"], colSpan:"*",
        	    	    	   checkBoxLabel:com_zimbra_octopus.AllowExternalSharing,
        	    	    	   resetToSuperLabel:ZaMsg.NAD_ResetToCOS,
        	    	    	   labelLocation:_RIGHT_, trueValue:"TRUE", falseValue:"FALSE",
        	    	    	   align:_RIGHT_
        	    	       },
        	    	       {type:_GROUP_,
        	    	    	   colSpan:"*",numCols:5,colSizes:["30px", "245px", "245px", "auto", "auto"],
        	    	           items:[
									{ref:ZaAccount.A2_zimbraExternalShareLimitLifetime, 
										type:_CHECKBOX_,subLabel:null,
										bmolsnr:true,
										id:"account_limit_external_share_lifetime",
										labelCssClass: "gridGroupBodyLabel",
										label:com_zimbra_octopus.LimitExternalShareLifetime,
										labelLocation:_RIGHT_, trueValue:"TRUE", falseValue:"FALSE",
									    enableDisableChangeEventSources:[ZaAccount.A_zimbraExternalSharingEnabled],
									    enableDisableChecks:[[XForm.checkInstanceValue,ZaAccount.A_zimbraExternalSharingEnabled,"TRUE"]],
									    updateElement:function(value) {
											Super_XFormItem.updateCss.call(this,5);
											Checkbox_XFormItem.prototype.updateElement.call(this, value);
										},
                                        elementChanged: function(elementValue,instanceValue, event) {
                                            if(elementValue != "TRUE") {
                                                this.setInstanceValue("0d", ZaAccount.A_zimbraFileExternalShareLifetime);
                                            }
                                            this.getForm().itemChanged(this, elementValue, event);
                                        },
										visibilityChecks:[]
									},
									{ref:ZaAccount.A_zimbraFileExternalShareLifetime, type:_LIFETIME_,
									   id:"account_external_share_lifetime",
		                               label:null, labelLocation:_NONE_,
		                               bmolsnr:true,
		                               labelCssStyle:"white-space:normal;",nowrap:false,labelWrap:true,
		                               enableDisableChangeEventSources:[ZaAccount.A2_zimbraExternalShareLimitLifetime,ZaAccount.A_zimbraExternalSharingEnabled],
		                               enableDisableChecks:[[XForm.checkInstanceValue,ZaCos.A2_zimbraExternalShareLimitLifetime,"TRUE"],[XForm.checkInstanceValue,ZaAccount.A_zimbraExternalSharingEnabled,"TRUE"]],
		                               updateElement:function(value) {
											Super_XFormItem.updateCss.call(this,5);
											Lifetime_XFormItem.prototype.updateElement.call(this, value);
		                       		   }
			                        },
			                        {	
										type:_DWT_BUTTON_,
										ref:".", label:ZaMsg.NAD_ResetToCOS,
										visibilityChecks:[
										    [XFormItem.prototype.hasReadPermission,ZaAccount.A_zimbraFileExternalShareLifetime],
										        function(){
										       		var rad1 = (this.getForm().getItemsById("account_external_share_lifetime")[0].getModelItem().getLocalValue(this.getInstance()) != null);
										       		var rad2 = (this.getForm().getItemsById("account_limit_external_share_lifetime")[0].getModelItem().getLocalValue(this.getInstance()) != null);	
										       		return (rad1 || rad2);										                	  
										         }
										],
										visibilityChangeEventSources:[ZaAccount.A_zimbraFileExternalShareLifetime,ZaAccount.A2_zimbraExternalShareLimitLifetime],
										onActivate:function(ev) {
											this.setInstanceValue(null, ZaAccount.A_zimbraFileExternalShareLifetime);
											this.setInstanceValue(null,ZaAccount.A2_zimbraExternalShareLimitLifetime);
                                            this.getForm().parent.setDirty(true);
			                            },
										onChange:ZaTabView.onFormFieldChanged
								   }  
        	    	           ]                                   
        	    	       }
                           
        	    	]
        	    },
        	    {type:_ZA_TOP_GROUPER_, id:"account_external_sharing_domain_settings",colSizes:["auto"],numCols:1,
        	    	label:com_zimbra_octopus.ExternalShareDomainPolicyGrouper,
        	    	items:[
						{ref:ZaAccount.A_zimbraExternalShareDomainWhitelistEnabled, 
							type:_SUPER_CHECKBOX_,checkboxSubLabel:null,
							colSizes:["275px","275px", "*"],
							checkBoxLabel:com_zimbra_octopus.LBL_ExternalShareDomainWhitelistCheckbox,
							trueValue:"TRUE", falseValue:"FALSE",
							visibilityChecks:[],
							resetToSuperLabel:ZaMsg.NAD_ResetToCOS,
						    enableDisableChangeEventSources:[ZaAccount.A_zimbraExternalSharingEnabled],
						    enableDisableChecks:[[XForm.checkInstanceValue,ZaAccount.A_zimbraExternalSharingEnabled,"TRUE"]]						 						   
						},
						{type:_CELLSPACER_, height:"100%"},
				      	{type:_SUPER_TEXTAREA_, ref:ZaAccount.A_zimbraExternalShareWhitelistDomain, 
				      		txtBoxLabel:com_zimbra_octopus.LBL_ExternalShareDomainWhitelist,
				      		txtBoxLabelCssClass:"gridGroupBodyLabel",
				      		resetToSuperLabel:ZaMsg.NAD_ResetToCOS,
				      		colSizes:["275px","275px", "*"],
							enableDisableChecks:[[XForm.checkInstanceValue,ZaAccount.A_zimbraExternalShareDomainWhitelistEnabled,"TRUE"],
							                     [XForm.checkInstanceValue,ZaAccount.A_zimbraExternalSharingEnabled,"TRUE"]],
							enableDisableChangeEventSources:[ZaAccount.A_zimbraExternalSharingEnabled,
							                                 ZaAccount.A_zimbraExternalShareDomainWhitelistEnabled]
				      	}
        	    	]
        	    },
        	    {type:_ZA_TOP_GROUPER_, id:"account_internal_sharing_expiration_settings", colSizes:["auto"],numCols:1,
        	    	label:com_zimbra_octopus.NAD_InternalShareExpirationGrouper,
        	    	items:[
        	    	       {type:_GROUP_,
        	    	    	   colSpan:"*",numCols:5,colSizes:["30px", "245px", "245px", "auto", "auto"],
        	    	           items:[
									{ref:ZaAccount.A2_zimbraInternalShareLimitLifetime, 
										type:_CHECKBOX_,subLabel:null,
										bmolsnr:true,
										id:"account_limit_internal_share_lifetime",
										labelCssClass: "gridGroupBodyLabel",
										label:com_zimbra_octopus.LimitInternalShareLifetime,
										labelLocation:_RIGHT_, trueValue:"TRUE", falseValue:"FALSE",
									    enableDisableChangeEventSources:[],
									    enableDisableChecks:[],
									    updateElement:function(value) {
											Super_XFormItem.updateCss.call(this,5);
											Checkbox_XFormItem.prototype.updateElement.call(this, value);
										},
                                        elementChanged: function(elementValue,instanceValue, event) {
                                            if(elementValue != "TRUE") {
                                                this.setInstanceValue("0d", ZaAccount.A_zimbraFileShareLifetime);
                                            }
                                            this.getForm().itemChanged(this, elementValue, event);
                                        },
										visibilityChecks:[]
									},
									{ref:ZaAccount.A_zimbraFileShareLifetime, type:_LIFETIME_,
									   id:"account_internal_share_lifetime",
		                               label:null, labelLocation:_NONE_,
		                               bmolsnr:true,
		                               labelCssStyle:"white-space:normal;",nowrap:false,labelWrap:true,
		                               enableDisableChangeEventSources:[ZaAccount.A2_zimbraInternalShareLimitLifetime],
		                               enableDisableChecks:[[XForm.checkInstanceValue,ZaCos.A2_zimbraInternalShareLimitLifetime,"TRUE"]],
		                               updateElement:function(value) {
											Super_XFormItem.updateCss.call(this,5);
											Lifetime_XFormItem.prototype.updateElement.call(this, value);
		                       		   }
			                        },
			                        {	
										type:_DWT_BUTTON_,
										ref:".", label:ZaMsg.NAD_ResetToCOS,
										visibilityChecks:[
										    [XFormItem.prototype.hasReadPermission,ZaAccount.A_zimbraFileShareLifetime],
										        function(){
										       		var rad1 = (this.getForm().getItemsById("account_internal_share_lifetime")[0].getModelItem().getLocalValue(this.getInstance()) != null);
										       		var rad2 = (this.getForm().getItemsById("account_limit_internal_share_lifetime")[0].getModelItem().getLocalValue(this.getInstance()) != null);	
										       		return (rad1 || rad2);										                	  
										         }
										],
										visibilityChangeEventSources:[ZaAccount.A_zimbraFileShareLifetime,ZaAccount.A2_zimbraInternalShareLimitLifetime],
										onActivate:function(ev) {
											this.setInstanceValue(null, ZaAccount.A_zimbraFileShareLifetime);
											this.setInstanceValue(null,ZaAccount.A2_zimbraInternalShareLimitLifetime);
                                            this.getForm().parent.setDirty(true);
			                            },
										onChange:ZaTabView.onFormFieldChanged
								   }  
        	    	           ]                                   
        	    	       }
                           
        	    	]
        	    }
        	]
        	case2.items = case2Items;
            tabCases.push(case2);  
		}
		
        //retention
        /*
		ZaAccountXFormView.FILE_RETENTION_TAB_ATTRS = [ZaAccount.A_zimbraFileExpirationWarningPeriod,ZaAccount.A_zimbraFileExpirationWarningPeriod,
		                                               ZaAccount.A_zimbraFileDeletionNotificationSubject,ZaAccount.A_zimbraFileDeletionNotificationBody,
		                                               ZaAccount.A_zimbraFileExpirationWarningSubject,ZaAccount.A_zimbraFileExpirationWarningBody];
		ZaAccountXFormView.FILE_RETENTION_TAB_RIGHTS = [];
		var fileRetentionTab = 0;
		
		if(true) {
			fileRetentionTab = ++this.TAB_INDEX;
	    	tabBarChoices.push({value:fileRetentionTab, label:com_zimbra_octopus.TABT_FileRetention});
	    }
		
		if(fileRetentionTab) {
			var case10 = {type:_ZATABCASE_, caseKey:fileRetentionTab, id:"account_file_retention_sharing_tab",numCols:1,colSizes:["*"]};
			var case10items = [
				{type:_ZA_TOP_GROUPER_, 
					label:com_zimbra_octopus.LBL_Thresholds,  
					items: [	
		               {ref:ZaAccount.A_zimbraFileLifetime, type:_SUPER_LIFETIME2_, 
		            	   resetToSuperLabel:ZaMsg.NAD_ResetToCOS,
		            	   msgName:com_zimbra_octopus.MSG_zimbraFileLifetime,
		            	   txtBoxLabel:com_zimbra_octopus.LBL_zimbraFileLifetime,
		            	   labelLocation:_LEFT_
		               },
		               {ref:ZaAccount.A_zimbraFileExpirationWarningPeriod, type:_SUPER_LIFETIME2_,
		            	   resetToSuperLabel:ZaMsg.NAD_ResetToCOS,
		            	   msgName:com_zimbra_octopus.MSG_zimbraFileExpirationWarningPeriod,
		            	   txtBoxLabel:com_zimbra_octopus.LBL_zimbraFileExpirationWarningPeriod,
		            	   labelLocation:_LEFT_
		               },
		               {type:_GROUP_,
    	    	    	   colSpan:2,numCols:6,colSizes:["50px", "auto","5px", "auto", "auto", "auto"],
    	    	           items:[
								{ref:ZaAccount.A_zimbraFileVersioningEnabled, 
									type:_CHECKBOX_,subLabel:null,
									bmolsnr:true,
									id:"account_limit_file_versions",
									label:com_zimbra_octopus.LBL_zimbraFileVersioningEnabled,
									labelLocation:_RIGHT_, trueValue:"TRUE", falseValue:"FALSE",
								    updateElement:function(value) {
										Super_XFormItem.updateCss.call(this,5);
										Checkbox_XFormItem.prototype.updateElement.call(this, value);
									}
								},
								{type:_CELLSPACER_, height:"100%"},
								{ref:ZaAccount.A_zimbraFileVersionLifetime, type:_LIFETIME2_,
								   id:"account_file_version_age",
	                               label:null, labelLocation:_NONE_,
	                               bmolsnr:true,
	                               labelCssStyle:"white-space:normal;",nowrap:false,labelWrap:true,
	                               enableDisableChangeEventSources:[ZaAccount.A_zimbraFileVersioningEnabled],
	                               enableDisableChecks:[[XForm.checkInstanceValue,ZaCos.A_zimbraFileVersioningEnabled,"TRUE"]],
	                               updateElement:function(value) {
										Super_XFormItem.updateCss.call(this,5);
										Lifetime_XFormItem.prototype.updateElement.call(this, value);
	                       		   }
		                        },
		                        {	
									type:_DWT_BUTTON_,
									ref:".", label:ZaMsg.NAD_ResetToCOS,
									visibilityChecks:[
									    [XFormItem.prototype.hasReadPermission,ZaAccount.A_zimbraFileVersionLifetime],
									    [XFormItem.prototype.hasReadPermission,ZaAccount.A_zimbraFileVersionLifetime],
									        function(){
									       		var rad1 = (this.getForm().getItemsById("account_file_version_age")[0].getModelItem().getLocalValue(this.getInstance()) != null);
									       		var rad2 = (this.getForm().getItemsById("account_limit_file_versions")[0].getModelItem().getLocalValue(this.getInstance()) != null);	
									       		return (rad1 || rad2);										                	  
									         }
									],
									visibilityChangeEventSources:[ZaAccount.A_zimbraFileVersionLifetime,ZaAccount.A_zimbraFileVersionLifetime],
									onActivate:function(ev) {
										this.setInstanceValue(null, ZaAccount.A_zimbraFileVersionLifetime);
										this.setInstanceValue(null,ZaAccount.A_zimbraFileVersionLifetime);
		                            },
									onChange:ZaTabView.onFormFieldChanged
							   }  
    	    	           ]                                   
    	    	       }		               
               ]},
               {type:_ZA_TOP_GROUPER_, 
					label:com_zimbra_octopus.LBL_Emailtemplates,  
           			items: [	               
		               {ref:ZaAccount.A_zimbraFileDeletionNotificationSubject, type:_SUPER_TEXTFIELD_, 
		            	   colSizes:["275px", "275px", "*"],
		            	   textFieldWidth: "250px",
		            	   resetToSuperLabel:ZaMsg.NAD_ResetToCOS,
		                   msgName:com_zimbra_octopus.LBL_zimbraFileDeletionNotificationSubject,
		                   txtBoxLabel:com_zimbra_octopus.LBL_zimbraFileDeletionNotificationSubject,
		                   labelLocation:_LEFT_
		               },
		               {ref:ZaAccount.A_zimbraFileDeletionNotificationBody,type:_SUPER_TEXTAREA_, 
		            	   colSizes:["275px", "275px", "*"],
		            	   txtBoxLabel:com_zimbra_octopus.LBL_zimbraFileDeletionNotificationBody,
		            	   resetToSuperLabel:ZaMsg.NAD_ResetToCOS,
		            	   msgName:com_zimbra_octopus.MSG_zimbraFileDeletionNotificationBody,
		            	   labelLocation:_LEFT_
				       },
				       {ref:ZaAccount.A_zimbraFileExpirationWarningSubject, type:_SUPER_TEXTFIELD_, 
		            	   colSizes:["275px", "275px", "*"],
		            	   textFieldWidth: "250px",				    	   
		                   msgName:com_zimbra_octopus.LBL_zimbraFileExpirationWarningSubject,
		                   resetToSuperLabel:ZaMsg.NAD_ResetToCOS,
		                   txtBoxLabel:com_zimbra_octopus.LBL_zimbraFileExpirationWarningSubject,
		                   labelLocation:_LEFT_
		               },
		               {ref:ZaAccount.A_zimbraFileExpirationWarningBody,type:_SUPER_TEXTAREA_, 
		            	   colSizes:["275px", "275px", "*"],
		            	   resetToSuperLabel:ZaMsg.NAD_ResetToCOS,
		            	   txtBoxLabel:com_zimbra_octopus.LBL_zimbraFileExpirationWarningBody,
		            	   msgName:com_zimbra_octopus.MSG_zimbraFileExpirationWarningBody,
		            	   labelLocation:_LEFT_
				       }
		            ]
               }
            ];
			case10.items=case10items;
			tabCases.push(case10);
				
		} */
	}
	ZaTabView.XFormModifiers["ZaAccountXFormView"].push(ZaOctopus.AccountXFormModifier);
}

if(ZaTabView.XFormModifiers["GlobalConfigXFormView"]) {

	ZaOctopus.GlobalXFormModifier = function(xFormObject,entry) {
		var cnt = xFormObject.items.length;
		var switchObj = null;
		for(var i = 0; i <cnt; i++) {
			if(xFormObject.items[i].type=="switch")  {
				switchObj = xFormObject.items[i];
				break;
			}
		}
		cnt = switchObj.items.length;

		var tabCases = xFormObject.items[2].items;
		var tabBarChoices = xFormObject.items[1].choices;

		GlobalConfigXFormView.SMTP_TAB_ATTRS = [ZaGlobalConfig.A_zimbraShareNotificationMtaEnabled,
                                                ZaGlobalConfig.A_zimbraShareNotificationMtaHostname,
                                                ZaGlobalConfig.A_zimbraShareNotificationMtaPort,
                                                ZaGlobalConfig.A_zimbraShareNotificationMtaConnectionType,
                                                ZaGlobalConfig.A_zimbraShareNotificationMtaAuthRequired,
                                                ZaGlobalConfig.A_zimbraShareNotificationMtaAuthAccount,
                                                ZaGlobalConfig.A_zimbraShareNotificationMtaAuthPassword
                                                ];
		GlobalConfigXFormView.SMTP_TAB_RIGHTS = [];
		var smtpTab = 0;

		if(ZaTabView.isTAB_ENABLED(entry,GlobalConfigXFormView.SMTP_TAB_ATTRS , GlobalConfigXFormView.SMTP_TAB_RIGHTS)) {
			smtpTab = ++this.TAB_INDEX;
	    	tabBarChoices.push({value:smtpTab, label:com_zimbra_octopus.TABT_SMTP_SETTING});
	    }

		if(smtpTab) {
        	var smtpCase = {type:_ZATABCASE_, colSizes:["auto"],numCols:1,caseKey:smtpTab, id:"global_smtp_tab"};
        	var smtpCaseItems = [
        	    {type:_ZA_TOP_GROUPER_, id:"global_smtp_settings", numCols:2,colSizes: ["275px","auto"],
        	    	label:com_zimbra_octopus.NAD_SmtpSettingGrouper,
        	    	items:[
                        {ref:ZaGlobalConfig.A_zimbraShareNotificationMtaEnabled, type: _CHECKBOX_,
                            label: com_zimbra_octopus.LBL_SmtpMtaEnabled,
                            trueValue: "TRUE", falseValue: "FALSE"
                        },
                        { ref: ZaGlobalConfig.A_zimbraShareNotificationMtaHostname,
                            type: _TEXTFIELD_,width: "60%",
                            label: com_zimbra_octopus.LBL_SmtpMtaHostName
                        },
                        { ref: ZaGlobalConfig.A_zimbraShareNotificationMtaPort,
                            type: _TEXTFIELD_, width: "60%",
                            label: com_zimbra_octopus.LBL_SmtpMtaPort
                        },
                        {  type:_GROUP_,  label:com_zimbra_octopus.LBL_SmtpEncryp, colSize:["250px", "*"],
                            visibilityChecks:[[XFormItem.prototype.hasReadPermission,ZaGlobalConfig.A_zimbraShareNotificationMtaConnectionType]],
                            items:[
                            {ref:ZaGlobalConfig.A_zimbraShareNotificationMtaConnectionType, type:_RADIO_, groupname:"global_connection_type_settings",
                                label:com_zimbra_octopus.LBL_MtaConnectionNoEncrypResult,
                                bmolsnr: true,
                                updateElement:function () {
                                    this.getElement().checked = (this.getInstanceValue() == "CLEARTEXT");
                                },
                                elementChanged: function(elementValue,instanceValue, event) {
                                    if (elementValue == true) {
                                        this.setInstanceValue ("CLEARTEXT");
                                        this.getForm().itemChanged(this.getParentItem().getParentItem().getParentItem(),"CLEARTEXT", event);
                                    }

                                }
							},
                            {ref:ZaGlobalConfig.A_zimbraShareNotificationMtaConnectionType, type:_RADIO_, groupname:"global_connection_type_settings",
                                label:com_zimbra_octopus.LBL_MtaConnectionSSL,
                                bmolsnr: true,
                                updateElement:function () {
                                    this.getElement().checked = (this.getInstanceValue() == "SSL");
                                },
                                elementChanged: function(elementValue,instanceValue, event) {
                                    if (elementValue == true) {
                                        this.setInstanceValue ("SSL");
                                        this.getForm().itemChanged(this.getParentItem().getParentItem().getParentItem(),"SSL", event);
                                    }

                                }
							},
                            {ref:ZaGlobalConfig.A_zimbraShareNotificationMtaConnectionType, type:_RADIO_, groupname:"global_connection_type_settings",
                                label:com_zimbra_octopus.LBL_MtaConnectionStartTLS,
                                bmolsnr: true,
                                updateElement:function () {
                                    this.getElement().checked = (this.getInstanceValue() == "STARTTLS");
                                },
                                elementChanged: function(elementValue,instanceValue, event) {
                                    if (elementValue == true) {
                                        this.setInstanceValue ("STARTTLS");
                                        this.getForm().itemChanged(this.getParentItem().getParentItem().getParentItem(),"STARTTLS", event);
                                    }

                                }
							}

                        ]

                        },
                        {  type:_GROUP_,  label:com_zimbra_octopus.LBL_SmtpAuth, colSize:["250px", "*"],
                            visibilityChecks:[[XFormItem.prototype.hasReadPermission,ZaGlobalConfig.A_zimbraShareNotificationMtaAuthRequired]],
                            items:[
                            {ref:ZaGlobalConfig.A_zimbraShareNotificationMtaAuthRequired, type:_RADIO_, groupname:"global_auth_required_settings",
                                label:com_zimbra_octopus.LBL_SmtpNoAuthRequired,
                                bmolsnr: true,
                                updateElement:function () {
                                    this.getElement().checked = (this.getInstanceValue() == "FALSE");
                                },
                                elementChanged: function(elementValue,instanceValue, event) {
                                    if (elementValue == true) {
                                        this.setInstanceValue ("FALSE");
                                        this.getForm().itemChanged(this.getParentItem().getParentItem().getParentItem(),instanceValue, event);
                                    }

                                }
							},
                            {ref:ZaGlobalConfig.A_zimbraShareNotificationMtaAuthRequired, type:_RADIO_, groupname:"global_auth_required_settings",
                                label:com_zimbra_octopus.LBL_MtaConnectionStartTLS,
                                bmolsnr: true,
                                updateElement:function () {
                                    this.getElement().checked = (this.getInstanceValue() == "TRUE");
                                },
                                elementChanged: function(elementValue,instanceValue, event) {
                                    if (elementValue == true) {
                                        this.setInstanceValue ("TRUE");
                                        this.getForm().itemChanged(this.getParentItem().getParentItem().getParentItem(),instanceValue, event);
                                    }

                                }
							},
                            { type: _DWT_ALERT_,
                              colSpan: "*",
                              containerCssStyle: "padding-bottom:0px",
                              style: DwtAlert.WARNING,
                              iconVisible: false,
                              content: com_zimbra_octopus.MSG_AuthAlert
                            }
                        ]

                        },
                        { ref: ZaGlobalConfig.A_zimbraShareNotificationMtaAuthAccount,
                            type: _TEXTFIELD_,width: "60%",
                            label: com_zimbra_octopus.LBL_SmtpMtaAuthAccount
                        },
                        { ref: ZaGlobalConfig.A_zimbraShareNotificationMtaAuthPassword,
                            type: _TEXTFIELD_, width: "60%",
                            label: com_zimbra_octopus.LBL_SmtpMtaAuthPassword
                        }

        	    	]
        	    }
        	]
        	smtpCase.items = smtpCaseItems;
            tabCases.push(smtpCase);
		}
	}
	ZaTabView.XFormModifiers["GlobalConfigXFormView"].push(ZaOctopus.GlobalXFormModifier);
}

if(ZaTabView.XFormModifiers["ZaServerXFormView"]) {

	ZaOctopus.ServerXFormModifier = function(xFormObject,entry) {
		var cnt = xFormObject.items.length;
		var switchObj = null;
		for(var i = 0; i <cnt; i++) {
			if(xFormObject.items[i].type=="switch")  {
				switchObj = xFormObject.items[i];
				break;
			}
		}
		cnt = switchObj.items.length;

		var tabCases = xFormObject.items[2].items;
		var tabBarChoices = xFormObject.items[1].choices;

		ZaServerXFormView.SMTP_TAB_ATTRS = [ZaServer.A_zimbraShareNotificationMtaEnabled,
                                            ZaServer.A_zimbraShareNotificationMtaHostname,
                                            ZaServer.A_zimbraShareNotificationMtaPort,
                                            ZaServer.A_zimbraShareNotificationMtaConnectionType,
                                            ZaServer.A_zimbraShareNotificationMtaAuthRequired,
                                            ZaServer.A_zimbraShareNotificationMtaAuthAccount,
                                            ZaServer.A_zimbraShareNotificationMtaAuthPassword
                                            ];
		ZaServerXFormView.SMTP_TAB_RIGHTS = [];
        ZaServerXFormView.checkIfConnectionTypeOverwritten = function () {
	        return this.getForm().getItemsById("ConectionType")[0].getModelItem().getLocalValue(this.getInstance()) != null;
        }
        ZaServerXFormView.resetConnectionTypeToGlobal = function () {
            this.setInstanceValue(null, ZaServer.A_zimbraShareNotificationMtaConnectionType);
        }

        ZaServerXFormView.checkIfAuthRequiredOverwritten = function () {
	        return this.getForm().getItemsById("AuthReuqired")[0].getModelItem().getLocalValue(this.getInstance()) != null;
        }
        ZaServerXFormView.resetAuthRequiredToGlobal = function () {
            this.setInstanceValue(null, ZaServer.A_zimbraShareNotificationMtaAuthRequired);
        }
		var smtpTab = 0;

		if(ZaTabView.isTAB_ENABLED(entry,ZaServerXFormView.SMTP_TAB_ATTRS , ZaServerXFormView.SMTP_TAB_RIGHTS)) {
			smtpTab = ++this.TAB_INDEX;
	    	tabBarChoices.push({value:smtpTab, label:com_zimbra_octopus.TABT_SMTP_SETTING});
	    }

		if(smtpTab) {
        	var smtpCase = {type:_ZATABCASE_, colSizes:["auto"],numCols:1,caseKey:smtpTab, id:"global_smtp_tab"};
        	var smtpCaseItems = [
        	    {type:_ZA_TOP_GROUPER_, id:"global_smtp_settings", numCols:2,colSizes: ["275px","auto"],
                    width: "100%",
        	    	label:com_zimbra_octopus.NAD_SmtpSettingGrouper,
        	    	items:[
                        {ref:ZaServer.A_zimbraShareNotificationMtaEnabled,
                            type:_SUPER_CHECKBOX_, resetToSuperLabel:ZaMsg.NAD_ResetToGlobal,
                            colSpan:2, width: "100%", numCols:3, colSizes:["275px", "*", "150px"],
                            checkBoxLabel:com_zimbra_octopus.LBL_SmtpMtaEnabled,
                            trueValue:"TRUE", falseValue:"FALSE",
                            onChange:ZaServerXFormView.onFormFieldChanged
                        },
                        { ref: ZaServer.A_zimbraShareNotificationMtaHostname,
                            colSpan:2, width: "100%", numCols:3, colSizes:["275px", "*", "150px"],
                            type: _SUPER_TEXTFIELD_,textFieldWidth: "60%",
                            txtBoxLabel: com_zimbra_octopus.LBL_SmtpMtaHostName,
                            onChange: ZaServerXFormView.onFormFieldChanged,
                            resetToSuperLabel:ZaMsg.NAD_ResetToGlobal
                        },
                        { ref: ZaServer.A_zimbraShareNotificationMtaPort,
                            colSpan:2, width: "100%", numCols:3, colSizes:["275px", "*", "150px"],
                            type: _SUPER_TEXTFIELD_, textFieldWidth: "60%",
                            txtBoxLabel: com_zimbra_octopus.LBL_SmtpMtaPort,
                            onChange: ZaServerXFormView.onFormFieldChanged,
                            resetToSuperLabel:ZaMsg.NAD_ResetToGlobal
                        },
                        {  type:_GROUP_,  label:com_zimbra_octopus.LBL_SmtpEncryp,
                            colSizes:["30px", "*", "150px"], numCols:3, width: "100%",
                            visibilityChecks:[[XFormItem.prototype.hasReadPermission,ZaServer.A_zimbraShareNotificationMtaConnectionType]],
                            items:[
                            {ref:ZaServer.A_zimbraShareNotificationMtaConnectionType, type:_RADIO_, groupname:"global_connection_type_settings",
                                label:com_zimbra_octopus.LBL_MtaConnectionNoEncrypResult,
                                bmolsnr: true,
                                updateElement:function () {
                                    Super_XFormItem.updateCss.call(this,1);
                                    this.getElement().checked = (this.getInstanceValue() == "CLEARTEXT");
                                },
                                elementChanged: function(elementValue,instanceValue, event) {
                                    if (elementValue == true) {
                                        this.setInstanceValue ("CLEARTEXT");
                                        this.getForm().itemChanged(this.getParentItem().getParentItem().getParentItem(),"CLEARTEXT", event);
                                    }

                                }
							},
                            {type:_DWT_BUTTON_, label:ZaMsg.NAD_ResetToGlobal,
                                visibilityChecks:[ZaServerXFormView.checkIfConnectionTypeOverwritten],
                                visibilityChangeEventSources:[ZaServer.A_zimbraShareNotificationMtaConnectionType],
                                onActivate:ZaServerXFormView.resetConnectionTypeToGlobal,
                                rowSpan:3, autoPadding: false
                            },
                            {ref:ZaServer.A_zimbraShareNotificationMtaConnectionType, type:_RADIO_, groupname:"global_connection_type_settings",
                                id: "ConectionType",
                                label:com_zimbra_octopus.LBL_MtaConnectionSSL,
                                bmolsnr: true,
                                updateElement:function () {
                                    Super_XFormItem.updateCss.call(this,1);
                                    this.getElement().checked = (this.getInstanceValue() == "SSL");
                                },
                                elementChanged: function(elementValue,instanceValue, event) {
                                    if (elementValue == true) {
                                        this.setInstanceValue ("SSL");
                                        this.getForm().itemChanged(this.getParentItem().getParentItem().getParentItem(),"SSL", event);
                                    }

                                }
							},
                            {ref:ZaServer.A_zimbraShareNotificationMtaConnectionType, type:_RADIO_, groupname:"global_connection_type_settings",
                                label:com_zimbra_octopus.LBL_MtaConnectionStartTLS,
                                bmolsnr: true,
                                updateElement:function () {
                                    Super_XFormItem.updateCss.call(this,1);
                                    this.getElement().checked = (this.getInstanceValue() == "STARTTLS");
                                },
                                elementChanged: function(elementValue,instanceValue, event) {
                                    if (elementValue == true) {
                                        this.setInstanceValue ("STARTTLS");
                                        this.getForm().itemChanged(this.getParentItem().getParentItem().getParentItem(),"STARTTLS", event);
                                    }

                                }
							}

                        ]

                        },
                        {  type:_GROUP_,  label:com_zimbra_octopus.LBL_SmtpAuth,
                            colSizes:["30px", "*", "150px"], numCols:3, width: "100%",
                            visibilityChecks:[[XFormItem.prototype.hasReadPermission,ZaServer.A_zimbraShareNotificationMtaAuthRequired]],
                            items:[
                            {ref:ZaServer.A_zimbraShareNotificationMtaAuthRequired, type:_RADIO_, groupname:"global_auth_required_settings",
                                label:com_zimbra_octopus.LBL_SmtpNoAuthRequired,
                                bmolsnr: true,
                                id: "AuthReuqired",
                                updateElement:function () {
                                    Super_XFormItem.updateCss.call(this,1);
                                    this.getElement().checked = (this.getInstanceValue() == "FALSE");
                                },
                                elementChanged: function(elementValue,instanceValue, event) {
                                    if (elementValue == true) {
                                        this.setInstanceValue ("FALSE");
                                        this.getForm().itemChanged(this.getParentItem().getParentItem().getParentItem(),instanceValue, event);
                                    }

                                }
							},
                            {type:_DWT_BUTTON_, label:ZaMsg.NAD_ResetToGlobal,
                                visibilityChecks:[ZaServerXFormView.checkIfAuthRequiredOverwritten],
                                visibilityChangeEventSources:[ZaServer.A_zimbraShareNotificationMtaAuthRequired],
                                onActivate:ZaServerXFormView.resetAuthRequiredToGlobal,
                                rowSpan:2, autoPadding: false
                            },
                            {ref:ZaServer.A_zimbraShareNotificationMtaAuthRequired, type:_RADIO_, groupname:"global_auth_required_settings",
                                label:com_zimbra_octopus.LBL_MtaConnectionStartTLS,
                                bmolsnr: true,
                                updateElement:function () {
                                    Super_XFormItem.updateCss.call(this,1);
                                    this.getElement().checked = (this.getInstanceValue() == "TRUE");
                                },
                                elementChanged: function(elementValue,instanceValue, event) {
                                    if (elementValue == true) {
                                        this.setInstanceValue ("TRUE");
                                        this.getForm().itemChanged(this.getParentItem().getParentItem().getParentItem(),instanceValue, event);
                                    }

                                }
							},
                            { type: _DWT_ALERT_,
                              colSpan: "*",
                              containerCssStyle: "padding-bottom:0px",
                              style: DwtAlert.WARNING,
                              iconVisible: false,
                              content: com_zimbra_octopus.MSG_AuthAlert
                            }

                        ]

                        },
                        { ref: ZaServer.A_zimbraShareNotificationMtaAuthAccount,
                            type: _SUPER_TEXTFIELD_,textFieldWidth: "60%",
                            colSpan:2, width: "100%", numCols:3, colSizes:["275px", "*", "150px"],
                            txtBoxLabel: com_zimbra_octopus.LBL_SmtpMtaAuthAccount,
                            onChange: ZaServerXFormView.onFormFieldChanged,
                            resetToSuperLabel:ZaMsg.NAD_ResetToGlobal
                        },
                        { ref: ZaServer.A_zimbraShareNotificationMtaAuthPassword,
                            type: _SUPER_TEXTFIELD_, textFieldWidth: "60%",
                            colSpan:2, width: "100%", numCols:3, colSizes:["275px", "*", "150px"],
                            txtBoxLabel: com_zimbra_octopus.LBL_SmtpMtaAuthPassword,
                            onChange: ZaServerXFormView.onFormFieldChanged,
                            resetToSuperLabel:ZaMsg.NAD_ResetToGlobal
                        }

        	    	]
        	    }
        	]
        	smtpCase.items = smtpCaseItems;
            tabCases.push(smtpCase);
		}
	}
	ZaTabView.XFormModifiers["ZaServerXFormView"].push(ZaOctopus.ServerXFormModifier);
}
if(ZaTabView.XFormModifiers["ZaHelpView"]) {
	ZaOctopus.HelpViewXFormModifier = function(xFormObject) {
            if (!ZaSettings.isNetworkVersion ()) {
                 return ;
            }
			var octopusNetworkHelpItems = [
				{type:_GROUP_,numCols:2, items: [
						{type:_OUTPUT_, value:AjxImg.getImageHtml("PDFDoc")},
						{type:_ANCHOR_, cssStyle:"font-size:12px;", showInNewWindow:true, labelLocation:_NONE_, label:com_zimbra_octopus.HELP_GUIDES_MAC_INSTALL,
							href:(location.pathname + "help/admin/pdf/o_macclient_install.pdf?locid=" + AjxEnv.DEFAULT_LOCALE)},
						{type:_OUTPUT_, value:AjxImg.getImageHtml("PDFDoc")},
						{type:_ANCHOR_, cssStyle:"font-size:12px;", showInNewWindow:true, labelLocation:_NONE_, label:com_zimbra_octopus.HELP_GUIDES_WIN_INSTALL,
							href:(location.pathname + "help/admin/pdf/o_windowsclient_install.pdf?locid=" + AjxEnv.DEFAULT_LOCALE)},
                        {type:_OUTPUT_, value:AjxImg.getImageHtml("PDFDoc")},
						{type:_ANCHOR_, cssStyle:"font-size:12px;", showInNewWindow:true, labelLocation:_NONE_, label:com_zimbra_octopus.HELP_GUIDES_ANDROID_INSTALL,
							href:(location.pathname + "help/admin/pdf/o_androidclient_install.pdf?locid=" + AjxEnv.DEFAULT_LOCALE)},
                    	{type:_OUTPUT_, value:AjxImg.getImageHtml("PDFDoc")},
						{type:_ANCHOR_, cssStyle:"font-size:12px;", showInNewWindow:true, labelLocation:_NONE_, label:com_zimbra_octopus.HELP_GUIDES_IOS_INSTALL,
							href:(location.pathname + "help/admin/pdf/o_iosclient_install.pdf?locid=" + AjxEnv.DEFAULT_LOCALE)}
				 	]
				},
                {type:_CELL_SPACER_},
                {type:_SPACER_, colSpan:"*"},
				{type:_OUTPUT_, cssStyle:"font-size:12px;", label:null, value:ZabMsg.HELP_OTHER_GUIDES_CONNNECTOR_INFO,
				 	cssStyle:"padding-right:10px;padding-left:10px;"},
			    {type:_CELL_SPACER_},
                {type:_SEPARATOR_, colSpan:1, cssClass:"helpSeparator"}  ,
                {type:_CELL_SPACER_}
			];
            var helpItems = xFormObject.items[0].items[0].items ;
			for (var i=0; i< helpItems.length; i++) {
                //insert teh networkHelpItems before the About button
                if (helpItems[i].id == "ZimbraHelpPageDownloadItems") {
					helpItems [i].items = helpItems[i].items.concat(octopusNetworkHelpItems) ;
                    break ;
                }
			}
		//}
	}
	ZaTabView.XFormModifiers["ZaHelpView"].push(ZaOctopus.HelpViewXFormModifier);
}

/*
ZaOctopus.addReportsTreeItem = function (tree) {
	//find out if we have any xmbx rights on any servers

	if(!this._monitoringTi) {
		this._monitoringTi = new DwtTreeItem({parent:tree,className:"overviewHeader",id:ZaId.getTreeItemId(ZaId.PANEL_APP,ZaId.PANEL_MONITORING, true)});
		this._monitoringTi.enableSelection(false);	
		this._monitoringTi.setText(ZaMsg.OVP_monitoring);
		this._monitoringTi.setData(ZaOverviewPanelController._TID, ZaZimbraAdmin._MONITORING);
	}
	
	this._auditReportTi = new DwtTreeItem({parent:this._monitoringTi,className:"AdminTreeItem"});
	this._auditReportTi.setText(com_zimbra_octopus.OVP_AuditReports);
	this._auditReportTi.setImage("CrossMailboxSearch");
	this._auditReportTi.setData(ZaOverviewPanelController._TID, ZaZimbraAdmin._AUDIT_REPORT_LIST);	
	
	if(ZaOverviewPanelController.overviewTreeListeners) {
		ZaOverviewPanelController.overviewTreeListeners[ZaZimbraAdmin._AUDIT_REPORT_LIST] = ZaOctopus.reportsTreeItemListener;
	}
	
	this._auditReportTemplateTi = new DwtTreeItem({parent:this._monitoringTi,className:"AdminTreeItem"});
	this._auditReportTemplateTi.setText(com_zimbra_octopus.OVP_AuditReportTemplates);
	this._auditReportTemplateTi.setImage("CrossMailboxSearch");
	this._auditReportTemplateTi.setData(ZaOverviewPanelController._TID, ZaZimbraAdmin._AUDIT_TEMPLATE_LIST);	
	
	if(ZaOverviewPanelController.overviewTreeListeners) {
		ZaOverviewPanelController.overviewTreeListeners[ZaZimbraAdmin._AUDIT_TEMPLATE_LIST] = ZaOctopus.templatesTreeItemListener;
	}

	
}

if(ZaOverviewPanelController.treeModifiers)
	ZaOverviewPanelController.treeModifiers.push(ZaOctopus.addReportsTreeItem);

ZaOctopus.reportsTreeItemListener = function (ev) {
	if(ZaApp.getInstance().getCurrentController()) {
		ZaApp.getInstance().getCurrentController().switchToNextView(ZaApp.getInstance().getAuditReportsController(),AuditReportsController.prototype.show, [AuditReport.getAuditReports()]);
	} else {					
		ZaApp.getInstance().getAuditReportsController().show(AuditReport.getAuditReports());
	}
}

ZaOctopus.templatesTreeItemListener = function (ev) {
	if(ZaApp.getInstance().getCurrentController()) {
		ZaApp.getInstance().getCurrentController().switchToNextView(ZaApp.getInstance().getAuditTemplatesListController(),AuditTemplatesListController.prototype.show,[AuditReport.getReportTemplates()]);
	} else {					
		ZaApp.getInstance().getAuditTemplatesListController().show(AuditReport.getReportTemplates());
	}
}

ZaApp.prototype.getAuditReportsController =
function(viewId) {
	if (viewId && this._controllers[viewId] != null) {
		return this._controllers[viewId];
	}else{
		return new AuditReportsController(this._appCtxt, this._container);
	}
}

ZaApp.prototype.getAuditTemplateController =
function(viewId) {
	if (viewId && this._controllers[viewId] != null) {
		return this._controllers[viewId];
	}else{
		return new AuditTemplateController(this._appCtxt, this._container);
	}
}

ZaApp.prototype.getAuditTemplatesListController =
function(viewId) {
	if (viewId && this._controllers[viewId] != null) {
		return this._controllers[viewId];
	}else{
		return new AuditTemplatesListController(this._appCtxt, this._container);
	}
}*/

ZaOctopus.cosInitMethod = function() {
	this[ZaCos.A2_zimbraExternalShareLimitLifetime] = this.attrs[ZaCos.A_zimbraFileExternalShareLifetime] ? "TRUE" : "FALSE";
	this[ZaCos.A2_zimbraInternalShareLimitLifetime] = this.attrs[ZaCos.A_zimbraFileShareLifetime] ? "TRUE" : "FALSE";
}

/*
 * Update Help link start
 *
 */

ZaUtil.HELP_URL = "help/admin/html/";
ZaHelpView.mainHelpPage = "admin_home_page.htm";
ZaHelpView.RELEASE_NOTE_LINK = "help/admin/pdf/o_generic_release_notes.pdf";
ZaHelpView.HELP_FORUM_LINK = "https://vmwareoctopus.socialcast.com";

ZaOctopus.octopusInit = function() {
	for(var a in com_zimbra_octopus) {
		ZaMsg[a] = com_zimbra_octopus[a];
	}
	//TODO: manage available views based on license
	ZaSettings.ALL_UI_COMPONENTS = [];
	//List views
	ZaSettings.ALL_UI_COMPONENTS.push({ value: ZaSettings.ACCOUNT_LIST_VIEW, label: ZaMsg.UI_Comp_AccountListView });
	ZaSettings.ALL_UI_COMPONENTS.push({ value: ZaSettings.DL_LIST_VIEW, label: ZaMsg.UI_Comp_DlListView });
	ZaSettings.ALL_UI_COMPONENTS.push({ value: ZaSettings.COS_LIST_VIEW, label: ZaMsg.UI_Comp_COSListView });
	ZaSettings.ALL_UI_COMPONENTS.push({ value: ZaSettings.DOMAIN_LIST_VIEW, label: ZaMsg.UI_Comp_DomainListView });
	ZaSettings.ALL_UI_COMPONENTS.push({ value: ZaSettings.SERVER_LIST_VIEW, label: ZaMsg.UI_Comp_ServerListView });
	ZaSettings.ALL_UI_COMPONENTS.push({ value: ZaSettings.ZIMLET_LIST_VIEW, label: ZaMsg.UI_Comp_ZimletListView });
	ZaSettings.ALL_UI_COMPONENTS.push({ value: ZaSettings.ADMIN_ZIMLET_LIST_VIEW, label: ZaMsg.UI_Comp_AdminZimletListView });
	ZaSettings.ALL_UI_COMPONENTS.push({ value: ZaSettings.GLOBAL_CONFIG_VIEW, label: ZaMsg.UI_Comp_globalConfigView });
	ZaSettings.ALL_UI_COMPONENTS.push({ value: ZaSettings.GLOBAL_STATUS_VIEW, label: ZaMsg.UI_Comp_GlobalStatusView });
	ZaSettings.ALL_UI_COMPONENTS.push({ value: ZaSettings.SAVE_SEARCH, label: ZaMsg.UI_Comp_SaveSearch });
	ZaSettings.ALL_UI_COMPONENTS.push({ value: ZaSettings.SERVER_STATS_VIEW, label: ZaMsg.UI_Comp_ServerStatsView });
	if(ZaItem.loadMethods["ZaAccount"]) {
		ZaItem.loadMethods["ZaAccount"].push(ZaOctopus.loadDevices);
	}
	if(ZaItem.initMethods["ZaCos"]) {
		ZaItem.initMethods["ZaCos"].push(ZaOctopus.cosInitMethod);
	}
}
ZaSettings.initMethods.push(ZaOctopus.octopusInit);

ZaSearch.getPredefinedSavedSearches =  function () {
    return [
        {name: ZaMsg.ss_locked_out_accounts, query: "(zimbraAccountStatus=*lockout*)"},
        {name: ZaMsg.ss_closed_accounts, query: "(zimbraAccountStatus=*closed*)"},
        {name: ZaMsg.ss_maintenance_accounts, query: "(zimbraAccountStatus=*maintenance*)"},
        {name: ZaMsg.ss_non_active_accounts, query: "(!(zimbraAccountStatus=*active*))" },
        {name: ZaMsg.ss_inactive_accounts_30, query: "(zimbraLastLogonTimestamp<=###JSON:{func: ZaSearch.getTimestampByDays, args:[-30]}###)"},
        {name: ZaMsg.ss_inactive_accounts_90, query: "(zimbraLastLogonTimestamp<=###JSON:{func: ZaSearch.getTimestampByDays, args:[-90]}###)"},
        {name: com_zimbra_octopus.ss_external_virtual_accounts, query: "(zimbraIsExternalVirtualAccount=TRUE)" }
    ];
}
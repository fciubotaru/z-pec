/**
 * Created by IntelliJ IDEA.
 * User: qinan
 * Date: 8/19/11
 * Time: 2:30 PM
 * To change this template use File | Settings | File Templates.
 */
ZaAccountViewMail = function () {}

ZaAccountViewMail.initExtraToolbarButton = function () {

    this._toolbarOperations[ZaOperation.VIEW_MAIL] = new ZaOperation(ZaOperation.VIEW_MAIL,
        com_zimbra_octopus.ACTBB_WebAccess, com_zimbra_octopus.ACTBB_WebAccess_tt, "ReadMailbox", "ReadMailbox",
        new AjxListener(this, ZaAccountViewMail._viewMailListener));

    if (!this._toolbarOrder) {
        this._toolbarOrder == [];
    }
    this._toolbarOrder.push (ZaOperation.VIEW_MAIL)  ;
}

if (ZaController.initToolbarMethods["ZaAccountListController"]) {
    ZaController.initToolbarMethods["ZaAccountListController"].push(ZaAccountViewMail.initExtraToolbarButton);
}

if (ZaController.initToolbarMethods["ZaSearchListController"]) {
    ZaController.initToolbarMethods["ZaSearchListController"].push(ZaAccountViewMail.initExtraToolbarButton);
}

ZaAccountViewMail.initExtraPopupButton = function () {
    this._popupOperations[ZaOperation.VIEW_MAIL] = new ZaOperation(ZaOperation.VIEW_MAIL,
        com_zimbra_octopus.ACTBB_WebAccess, com_zimbra_octopus.ACTBB_WebAccess_tt, "ReadMailbox", "ReadMailbox",
        new AjxListener(this, ZaAccountViewMail._viewMailListener));
    if (this._popupOrder) {
        this._popupOrder.push(ZaOperation.VIEW_MAIL);
    }
}

if (ZaController.initPopupMenuMethods["ZaAccountListController"]) {
    ZaController.initPopupMenuMethods["ZaAccountListController"].push(ZaAccountViewMail.initExtraPopupButton);
}

if (ZaController.initPopupMenuMethods["ZaAccountViewController"]) {
    ZaController.initPopupMenuMethods["ZaAccountViewController"].push(ZaAccountViewMail.initExtraPopupButton);
}

if (ZaController.initPopupMenuMethods["ZaSearchListController"]) {
    ZaController.initPopupMenuMethods["ZaSearchListController"].push(ZaAccountViewMail.initExtraPopupButton);
}

ZaAccountViewMail._viewMailListenerLauncher =
function(account) {
	try {
		var obj;
		var accId;
		if(account.type == ZaItem.ACCOUNT || account.type == ZaItem.RESOURCE) {
			obj = ZaAccount.getViewMailLink(account.id);
			accId = account.id;
		} else if(account.type == ZaItem.ALIAS && account.attrs[ZaAlias.A_AliasTargetId]) {
			obj = ZaAccount.getViewMailLink(account.attrs[ZaAlias.A_AliasTargetId]);
			accId = account.attrs[ZaAlias.A_AliasTargetId];
			account = new ZaAccount();
		} else {
			return;
		}
		if(!account[ZaAccount.A2_publicMailURL]) {
			account.load("id", accId);
		}
		if(!account[ZaAccount.A2_publicMailURL]) {
			account[ZaAccount.A2_publicMailURL] = ["http://",ZaAccount.getDomain(account[ZaAccount.A_name]),":7070"].join("");
		}
		if(!obj.authToken || !obj.lifetime)
			throw new AjxException(ZaMsg.ERROR_FAILED_TO_GET_CREDENTIALS, AjxException.UNKNOWN, "ZaAccountListController.prototype._viewMailListener");

		var mServer = [account[ZaAccount.A2_publicMailURL], "/service/preauth?authtoken=",obj.authToken,"&isredirect=1&adminPreAuth=1"].join("");
		mServer = AjxStringUtil.trim(mServer,true);
		var win = window.open(mServer, "_blank");
	} catch (ex) {
		this._handleException(ex, "ZaAccountViewMail._viewMailListenerLauncher", null, false);
	}
}

ZaAccountViewMail._viewMailListener =
function(ev) {
	try {
		var account = null;
		if (this instanceof ZaAccountListController || this instanceof ZaSearchListController){
			var accounts = this._contentView.getSelection();
			if(!accounts || accounts.length<=0) {
				return;
			}
			account = accounts[0];

		} else if (this instanceof ZaAccountViewController || this instanceof ZaDLController || this instanceof ZaResourceController){
			account = this._currentObject;
		} else {
			return;
		}
		if (account){
			ZaAccountViewMail._viewMailListenerLauncher.call(this, account);
		}
	} catch (ex) {
		this._handleException(ex, "ZaAccountViewMail._viewMailListener", null, false);
	}
}

ZaAccountViewMail.changeActionsStateMethod =
function () {
    var cnt = this._contentView.getSelectionCount();
    if (cnt == 1) {
        var item = this._contentView.getSelection()[0];
        if (item) {

            if (((item.type == ZaItem.ALIAS) && (item.attrs[ZaAlias.A_targetType] == ZaItem.DL))
                || (item.type == ZaItem.DL)) {
                if (this._toolbarOperations[ZaOperation.VIEW_MAIL]) {
                    this._toolbarOperations[ZaOperation.VIEW_MAIL].enabled = false;
                }

                if(this._popupOperations[ZaOperation.VIEW_MAIL]) {
                    this._popupOperations[ZaOperation.VIEW_MAIL].enabled = false;
                }
            }
            if (item.type == ZaItem.DL) {
                if(this._popupOperations[ZaOperation.VIEW_MAIL])
				 	this._popupOperations[ZaOperation.VIEW_MAIL].enabled = false;

				if(this._toolbarOperations[ZaOperation.VIEW_MAIL])
				 	this._toolbarOperations[ZaOperation.VIEW_MAIL].enabled = false;

            }
            if (item.type == ZaItem.ACCOUNT) {
				var enable = false;
				if(ZaZimbraAdmin.currentAdminAccount.attrs[ZaAccount.A_zimbraIsAdminAccount] == 'TRUE') {
					enable = true;
				} else if (AjxUtil.isEmpty(item.rights)) {
					item.loadEffectiveRights("id", item.id, false);
				}
                if(!enable) {
					if(!ZaItem.hasRight(ZaAccount.VIEW_MAIL_RIGHT,item)) {
						 if(this._popupOperations[ZaOperation.VIEW_MAIL])
						 	this._popupOperations[ZaOperation.VIEW_MAIL].enabled = false;

						 if(this._toolbarOperations[ZaOperation.VIEW_MAIL])
						 	this._toolbarOperations[ZaOperation.VIEW_MAIL].enabled = false;
					}
                }
            } else if ((item.type == ZaItem.ALIAS) && (item.attrs[ZaAlias.A_targetType] == ZaItem.ACCOUNT))  {
				if(!item.targetObj)
					item.targetObj = item.getAliasTargetObj() ;

				var enable = false;
				if (ZaZimbraAdmin.currentAdminAccount.attrs[ZaAccount.A_zimbraIsAdminAccount] == 'TRUE') {
					enable = true;
				} else if (AjxUtil.isEmpty(item.targetObj.rights)) {
					item.targetObj.loadEffectiveRights("id", item.id, false);
				}
				if(!enable) {
					if(!ZaItem.hasRight(ZaAccount.VIEW_MAIL_RIGHT,item.targetObj)) {
						 if(this._popupOperations[ZaOperation.VIEW_MAIL])
						 	this._popupOperations[ZaOperation.VIEW_MAIL].enabled = false;

						 if(this._toolbarOperations[ZaOperation.VIEW_MAIL])
						 	this._toolbarOperations[ZaOperation.VIEW_MAIL].enabled = false;
					}
                }
            } else if ((item.type == ZaItem.ALIAS) && (item.attrs[ZaAlias.A_targetType] == ZaItem.RESOURCE))  {
				if(!item.targetObj)
					item.targetObj = item.getAliasTargetObj() ;

				var enable = false;
				if (ZaZimbraAdmin.currentAdminAccount.attrs[ZaAccount.A_zimbraIsAdminAccount] == 'TRUE') {
					enable = true;
				} else if (AjxUtil.isEmpty(item.targetObj.rights)) {
					item.targetObj.loadEffectiveRights("id", item.id, false);
				}
                if(!enable) {
                    if(!ZaItem.hasRight(ZaResource.VIEW_RESOURCE_MAIL_RIGHT,item.targetObj)) {
                         if(this._popupOperations[ZaOperation.VIEW_MAIL])
                            this._popupOperations[ZaOperation.VIEW_MAIL].enabled = false;

                         if(this._toolbarOperations[ZaOperation.VIEW_MAIL])
                            this._toolbarOperations[ZaOperation.VIEW_MAIL].enabled = false;
                    }
                }
            } else if(item.type == ZaItem.RESOURCE) {
				var enable = false;
				if(ZaZimbraAdmin.currentAdminAccount.attrs[ZaAccount.A_zimbraIsAdminAccount] == 'TRUE') {
					enable = true;
				} else if (AjxUtil.isEmpty(item.rights)) {
					item.loadEffectiveRights("id", item.id, false);
				}
				if(!enable) {
					if(!ZaItem.hasRight(ZaResource.VIEW_RESOURCE_MAIL_RIGHT,item)) {
						 if(this._popupOperations[ZaOperation.VIEW_MAIL])
						 	this._popupOperations[ZaOperation.VIEW_MAIL].enabled = false;

						 if(this._toolbarOperations[ZaOperation.VIEW_MAIL])
						 	this._toolbarOperations[ZaOperation.VIEW_MAIL].enabled = false;
					}
                }
            }

        } else {
			if(this._toolbarOperations[ZaOperation.VIEW_MAIL]) {
				this._toolbarOperations[ZaOperation.VIEW_MAIL].enabled = false;
			}
			if(this._popupOperations[ZaOperation.VIEW_MAIL]) {
				this._popupOperations[ZaOperation.VIEW_MAIL].enabled = false;
			}
        }
    } else {
		if(this._toolbarOperations[ZaOperation.VIEW_MAIL]) {
			this._toolbarOperations[ZaOperation.VIEW_MAIL].enabled = false;
		}
		if(this._popupOperations[ZaOperation.VIEW_MAIL]) {
			this._popupOperations[ZaOperation.VIEW_MAIL].enabled = false;
		}
    }
}
if(ZaController.changeActionsStateMethods["ZaAccountListController"]) {
    ZaController.changeActionsStateMethods["ZaAccountListController"].push(ZaAccountViewMail.changeActionsStateMethod);
}
if(ZaController.changeActionsStateMethods["ZaSearchListController"]) {
    ZaController.changeActionsStateMethods["ZaSearchListController"].push(ZaAccountViewMail.changeActionsStateMethod);
}
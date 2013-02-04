ZmPecMsgsZimlet = function() {
};
ZmPecMsgsZimlet.prototype = new ZmZimletBase();
ZmPecMsgsZimlet.prototype.constructor = ZmPecMsgsZimlet;

ZmPecMsgsZimlet.prototype.init = function() {
	//TODO make a header text for 
	this.pHeadStart_Html=this.getUserProperty("text_mailPECHeaderStart");
	this.pHeadEnd_Html=this.getUserProperty("text_mailPECHeaderStart");
	this.pHeadStart_Text=this.getUserProperty("text_mailPECHeaderStart");
	this.pHeadEnd_Text=this.getUserProperty("text_mailPECHeaderStop");
};


ZmPecMsgsZimlet.prototype.onMsgView = function(msg, oldMsg) {

	// logics is now rendered ZmPecMsgsZimlet.prototype.onShowView

};

ZmPecMsgsZimlet.prototype.onShowView = function(viewId) {

	var viewType = appCtxt.getViewTypeFromId(viewId);
	//TODO nothing for the moment
	switch (viewType) {
	case ZmId.VIEW_CONVLIST: {
		break;
	}

	case ZmId.VIEW_MSG: {
		
		break;
	}

	case ZmId.VIEW_CONV: {
		
		break;
	}

	}

};




ZmPecMsgsZimlet.prototype.initializeToolbar = function(app, toolbar,
		controller, viewId) {

	var viewType = appCtxt.getViewTypeFromId(viewId);
	if (viewType == ZmId.VIEW_CONVLIST || viewType == ZmId.VIEW_CONV
			|| viewType == ZmId.VIEW_TRAD || viewType == ZmId.VIEW_MSG) {
		var buttonIndex = -1;
		for ( var i = 0, count = toolbar.opList.length; i < count; i++) {
			if (toolbar.opList[i] == ZmId.OP_VIEW) {
				buttonIndex = i + 1;
				break;
			}
		}

		var buttonArgs = {
			text : "PEC Certificate",
			tooltip : this.getMessage("tooltip"),
			index : buttonIndex,
			image : "ignoremsgs-panelIcon"
		};
		// no callback only button text
		toolbar.createOp(null, buttonArgs);

	}

};


/**
 * Is called when try to show an email
 * 
 * @param msg
 * @param objMgr
 *
 */
ZmPecMsgsZimlet.prototype.onFindMsgObjects = function(msg, objMgr) {

	// message
	var parts = "";
	var strStartTxt="";
	var strEndTxt="";
	
	
	if (msg.hasContentType(ZmMimeTable.TEXT_HTML)) {
		parts = msg.getBodyParts(ZmMimeTable.TEXT_HTML);

	} else if (msg.hasContentType(ZmMimeTable.TEXT_PLAIN)) {
		parts = msg.getBodyParts(ZmMimeTable.TEXT_PLAIN);
	}
	
	if (msg.isHtmlMail()){
		strStartTxt=this.getUserProperty("text_mailPECHeaderStart");
		strEndTxt=this.getUserProperty("text_mailPECHeaderEnd");
	}else{
		strStartTxt=this.getUserProperty("html_mailPECHeaderStart");
		strEndTxt=this.getUserProperty("html_mailPECHeaderEnd");
	}

	
	for ( var i = 0; i < parts.length; i++) {

		var content = parts[i].getContent();
		var firstOccurence = content
				.indexOf(strStartTxt);
		var lastOccurence = content.lastIndexOf(strEndTxt);

		if (firstOccurence != -1 && lastOccurence != -1) {
			// then extract message body
			
			var modifiedContent = content.substring(0, firstOccurence)
					+ content.substr(lastOccurence + 13);
			console.log("Original content" + content);
			
			// content
			parts[i].setContent(modifiedContent);
			
			//FIXME check problems with html, check why fragment is not updated
			//replace fragment
			msg.fragment=modifiedContent;
			msg.fragment=msg.getFragment(500);
			
			//TODO find a way to insert in header view an email that show that is verified
			//ZmMailMsg.requestHeaders["PEC"] = "PEC";
			ZmMailMsgView.displayAdditionalHdrsInMsgView["PEC"] = "Verified emails execution";

		}

	}
};

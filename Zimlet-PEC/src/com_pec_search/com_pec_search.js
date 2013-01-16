/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Zimlets
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

com_pec_search_HandlerObject = function() {
};

com_pec_search_HandlerObject.prototype = new ZmZimletBase;
com_pec_search_HandlerObject.prototype.constructor = com_pec_search_HandlerObject;

/**
 * Double clicked.
 */
com_pec_search_HandlerObject.prototype.doubleClicked = function() {
	this.singleClicked();
};

/**
 * Single clicked.
 */
com_pec_search_HandlerObject.prototype.singleClicked = function() {
	this._displayDialog();
};

/**
 * Displays the dialog.
 * 
 */
com_pec_search_HandlerObject.prototype._displayDialog = function() {
	if (this.pbDialog) { // if zimlet dialog already exists...
		this.pbDialog.popup(); // simply popup the dialog
		return;
	}

	var sDialogTitle = this.getMessage("simpledialog_dialog_title");
	var sStatusMsg = this.getMessage("simpledialog_status_launch");

	// TODO replace current simple panel box with list DwtListView
	this.pView = new DwtComposite(this.getShell()); // creates an empty div as a

	// child of main shell div
	this.pView.setSize("350", "250"); // set width and height
	this.pView.getHtmlElement().style.overflow = "auto"; // adds scrollbar
	this.pView.getHtmlElement().innerHTML = this._createDialogView(); // insert

	// pass the title, view & buttons information to create dialog box
	this.pbDialog = new ZmDialog({
		title : sDialogTitle,
		view : this.pView,
		parent : this.getShell(),
		standardButtons : [ DwtDialog.OK_BUTTON ]
	});

	this.pbDialog.setButtonListener(DwtDialog.OK_BUTTON, new AjxListener(this,
			this._closeBtnListener));

	this.pbDialog.popup(); // show the dialog

	appCtxt.getAppController().setStatusMsg(sStatusMsg);

	// performing actual search
	this.doInternalSearch();
};

/**
 * Creates the dialog view.
 * 
 * @author csfercoci @
 */
com_pec_search_HandlerObject.prototype._createDialogView = function() {
	var html = AjxTemplate.expand("com_pec_search.templates.table_temp#Main");
	return html;
};

/**
 * The "Close" button listener.
 * 
 */
com_pec_search_HandlerObject.prototype._closeBtnListener = function() {

	this.pbDialog.popdown(); // hide the dialog
};

/**
 * Perform an internal search
 * 
 * @param _limit
 * @param _offset
 */
com_pec_search_HandlerObject.prototype.doInternalSearch = function() {

	var callbck = new AjxCallback(this, this._handleInternalSrcResponse);
	var errcallbck = new AjxCallback(this, this._handleInternalErrSrcResponse);

	var _types = new AjxVector();

	// search only in messages
	_types.add(ZmId.ITEM_MSG);
	
	appCtxt.getSearchController().resetSearchToolbar(); 
	
	appCtxt.getSearchController().search({
		query : "z-pec",
		userText : false,
		limit : 6500,
		offset : 0,
		types : _types,
		noRender : true,
		callback : callbck,
		errorCallback : errcallbck
	});
};

/**
 * Handle internal response for what we've done
 * 
 * @author csfercoci
 * @since 14.01.2012
 * @param result
 *            ajax result
 */
com_pec_search_HandlerObject.prototype._handleInternalSrcResponse = function(
		result) {

	appCtxt.getAppController().setStatusMsg("Result for z-pec text");

	console.log("entered in search response");
	var msgs = result.getResponse().getResults(ZmId.ITEM_MSG).getVector()
			.getArray();

	if (msgs.length == 0) {// no results
		appCtxt.getAppController().setStatusMsg("No results");
		this._closeBtnListener();
		return;
	}

	for ( var i = 0; i < msgs.length; i++) {
		var eml = msgs[i];
		var tbl = document.getElementById('tbl_search_refiner'); // table
		// reference
		
		row = tbl.insertRow(tbl.rows.length); // append table row

		var c0 = row.insertCell(0).innerHTML=eml._addrs.FROM._array[0].address;
		var c1 = row.insertCell(1).innerHTML=eml._addrs.FROM._array[0].address;
		c1.appendChild(div);
	}

};

/**
 * Handler ajax error message
 * 
 * @since 15.01.2012
 * @param result
 */
com_pec_search_HandlerObject.prototype._handleInternalErrSrcResponse = function(
		result) {
	appCtxt.getAppController().setStatusMsg("Error in search");
};

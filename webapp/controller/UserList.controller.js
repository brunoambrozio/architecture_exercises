sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	var _url    = "/destinations/SAP_ERP";
	var _query  = "/sap/opu/odata/sap/ZHR_BBA_USER_SRV";	
	
	var _usrid  			  = null;
	var _that				  = null;

	jQuery.sap.require("sap.m.MessageBox");
	
	return Controller.extend("com.exercise.user.EX_USER_UI5_TO_SAP.controller.UserList", {

		/**
		 * Initiate the controller
		 */		
		onInit: function () {
			
			this.readData();
		},

		/**
		 * Open Popup
		 */
		onOpenPopup: function (oEvent) {
			
			if (this._Dialog == null) {
				this._Dialog = sap.ui.xmlfragment("com.exercise.user.EX_USER_UI5_TO_SAP.view.Upsert", this);
			}
			this._Dialog.open();

			sap.ui.getCore().byId("inputUsrid").setValueState(sap.ui.core.ValueState.None);
			sap.ui.getCore().byId("inputFirstname").setValueState(sap.ui.core.ValueState.None);
			sap.ui.getCore().byId("inputLastname").setValueState(sap.ui.core.ValueState.None);
			sap.ui.getCore().byId("inputGender").setValueState(sap.ui.core.ValueState.None);
		},
		
		/**
		 * Close Popup
		 */
		onClosePopup: function (oEvent) {
			_that._Dialog.close();
		},

		/**
		 * Open popup (fragment) to create
		 */
		onCreatePopup: function () {

			this.onOpenPopup();

			sap.ui.getCore().byId("inputUsrid").setValue('');
			sap.ui.getCore().byId("inputFirstname").setValue('');
			sap.ui.getCore().byId("inputLastname").setValue('');
			sap.ui.getCore().byId("inputGender").setSelectedKey('');
			
			sap.ui.getCore().byId("inputUsrid").setEditable(true);
		},

		/**
		 * Open popup (fragment) to update
		 */	
		onUpdatePopup: function (oEvent) {

			var source		 = oEvent.getSource();
			var binding      = source.getBindingContext("model_userset");
			var path		 = binding.getPath();
			var selectedItem = path.substr(9);
			
			var selectedLine = binding;
			var usrid        = selectedLine.getObject().Usrid;
			var firstName    = selectedLine.getObject().Firstname;
			var lastName     = selectedLine.getObject().Lastname;
			var gender       = selectedLine.getObject().Gender;
			
			this.onOpenPopup();
			sap.ui.getCore().byId("inputUsrid").setValue(usrid);
			sap.ui.getCore().byId("inputFirstname").setValue(firstName);
			sap.ui.getCore().byId("inputLastname").setValue(lastName);
			sap.ui.getCore().byId('inputGender').setSelectedKey(gender);
			
			sap.ui.getCore().byId("inputUsrid").setEditable(false);
		},
		
		/**
		 * Open popup (dialog) to delete
		 */	
		onDeletePopup: function (oEvent) {

			var source		 = oEvent.getSource();
			var binding      = source.getBindingContext("model_userset");
			var path		 = binding.getPath();
			var selectedItem = path.substr(9);
			
			var selectedLine = binding;
			var usrid        = selectedLine.getObject().Usrid;
			_usrid 			 = usrid;
			
			_that    = this;
		
			sap.m.MessageBox.show(
			  "Are you sure to delete the selected item?", {
			      icon: sap.m.MessageBox.Icon.INFORMATION,
			      title: "Confirmation",
			      actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
			      onClose: function(oAction) { 
			      	
			      	if (oAction === sap.m.MessageBox.Action.YES) {
			      		_that.deleteProc(oEvent);
			      	} 
			      }
			  }
			);
		},

		/**
		 * Forward the process from fragment to Create or Update
		 */		
		onUpsert: function (oEvent) {
			
			var usridEditable = sap.ui.getCore().byId("inputUsrid").getEditable();
			
			var validadeForm = this.validateForm();
			
			if (validadeForm == true) {
			
				if (usridEditable == true) {
					this.createProc();
				} else {
					this.updateProc();
				}
			}
		},	

		/**
		 * (D)elete data
		 */
		deleteProc: function (oEvent) {
			
			_that       = this;
				
			var usrid     = _usrid;
			
			//Request Delete
			var oModel = new sap.ui.model.odata.v2.ODataModel(_url + _query, true);	
			oModel.remove("/UserSet('" + usrid + "')",  
			{
				success: function(oData, oResponse){

					var msgHeader		 = oResponse.headers["sap-message"];
					var msgHeaderObject = JSON.parse(msgHeader);
					
					if (msgHeaderObject.severity === 'error') {
						sap.m.MessageBox.show(msgHeaderObject.message, sap.m.MessageBox.Icon.ERROR);
					} else {
						sap.m.MessageBox.show(msgHeaderObject.message, sap.m.MessageBox.Icon.SUCCESS);
		            	_that.readData();
					}

			    }, 
				
				error: function(oSome, someOther){
					sap.m.MessageBox.show("User Deleting Failed!", sap.m.MessageBox.Icon.ERROR);
			    },
			});	
		},

		/**
		 * (U)pdate data
		 */
		updateProc: function () {

			_that       = this;
			
			//Get data from screen
			var usrid     = sap.ui.getCore().byId("inputUsrid").getValue();
			var firstName = sap.ui.getCore().byId("inputFirstname").getValue();
			var lastName  = sap.ui.getCore().byId("inputLastname").getValue();
			var gender    = sap.ui.getCore().byId("inputGender").getSelectedKey();

			//Set data into JSON format
			var oEntry = {};
			oEntry.Usrid	  = usrid;
			oEntry.Firstname  = firstName;
			oEntry.Lastname   = lastName;
			oEntry.Gender     = gender;

			//Request Update
			var oModel = new sap.ui.model.odata.v2.ODataModel(_url + _query, true);	
			oModel.update("/UserSet('" + usrid + "')", oEntry, 
			{
				success: function(oData, oResponse){

					var msgHeader		 = oResponse.headers["sap-message"];
					var msgHeaderObject = JSON.parse(msgHeader);
					
					if (msgHeaderObject.severity === 'error') {
						sap.m.MessageBox.show(msgHeaderObject.message, sap.m.MessageBox.Icon.ERROR);
					} else {
						sap.m.MessageBox.show(msgHeaderObject.message, sap.m.MessageBox.Icon.SUCCESS);
						_that.onClosePopup();
		            	_that.readData();
					}
			    }, 
				
				error: function(oSome, someOther){
					sap.m.MessageBox.show("User Updating Failed!", sap.m.MessageBox.Icon.ERROR);
			    },
			});		
		},

		/**
		 * (C)reate data
		 */
		createProc: function () {

			_that          = this;
			
			//Get data from screen
			var usrid     = sap.ui.getCore().byId("inputUsrid").getValue();
			var firstName = sap.ui.getCore().byId("inputFirstname").getValue();
			var lastName  = sap.ui.getCore().byId("inputLastname").getValue();
			var gender    = sap.ui.getCore().byId("inputGender").getSelectedKey();
			
			//Set data into JSON format
			var oEntry = {};
			oEntry.Usrid	  = usrid;
			oEntry.Firstname  = firstName;
			oEntry.Lastname   = lastName;
			oEntry.Gender     = gender;

			//Request Create
			var oModel = new sap.ui.model.odata.v2.ODataModel(_url + _query, true);	
			oModel.create("/UserSet", oEntry, 
			{
				success: function(oData, oResponse){
					
					var msgHeader		 = oResponse.headers["sap-message"];
					var msgHeaderObject = JSON.parse(msgHeader);
					
					if (msgHeaderObject.severity === 'error') {
						sap.m.MessageBox.show(msgHeaderObject.message, sap.m.MessageBox.Icon.ERROR);
					} else {
						sap.m.MessageBox.show(msgHeaderObject.message, sap.m.MessageBox.Icon.SUCCESS);
		            	_that.onClosePopup();
						_that.readData();
					}
			    }, 
				
				error: function(oSome, someOther){
					sap.m.MessageBox.show("User Creating Failed!", sap.m.MessageBox.Icon.ERROR);
			    },
			});	
		},	


		/**
		 * (R)ead Data
		 */		
		readData: function () {
			
			//https://sapui5.hana.ondemand.com/1.34.9/docs/guide/6c47b2b39db9404582994070ec3d57a2.html
			
			_that	   = this;
			
			var oModel = new sap.ui.model.odata.v2.ODataModel(_url + _query, true);
			var json = new sap.ui.model.json.JSONModel();	
			oModel.read("/UserSet", {
				success: function (oData, response) {
					json.setData(oData);
				},
				 error: function (oError, response) {
					alert(oError);
				}
			})
			
			this.getView().setModel(json, "model_userset");
		},
		
		/**
		 * Validate Form
		 */		
		validateForm: function () {
			
			var validated = true;
			
			var usrid     = sap.ui.getCore().byId("inputUsrid").getValue();
			var firstName = sap.ui.getCore().byId("inputFirstname").getValue();
			var lastName  = sap.ui.getCore().byId("inputLastname").getValue();
			var gender    = sap.ui.getCore().byId("inputGender").getSelectedKey();
			
			if (!usrid || null){ 
				sap.ui.getCore().byId("inputUsrid").setValueState(sap.ui.core.ValueState.Error);
				validated = false;
			} else {
				sap.ui.getCore().byId("inputUsrid").setValueState(sap.ui.core.ValueState.None);
			}
			
			if (!firstName || null){ 
				sap.ui.getCore().byId("inputFirstname").setValueState(sap.ui.core.ValueState.Error);
				validated = false;
			} else {
				sap.ui.getCore().byId("inputFirstname").setValueState(sap.ui.core.ValueState.None);
			}
			
			if (!lastName || null){ 
				sap.ui.getCore().byId("inputLastname").setValueState(sap.ui.core.ValueState.Error);
				validated = false;
			} else {
				sap.ui.getCore().byId("inputLastname").setValueState(sap.ui.core.ValueState.None);
			}
			
			if (!gender || null){ 
				sap.ui.getCore().byId("inputGender").setValueState(sap.ui.core.ValueState.Error);
				validated = false;
			} else {
				sap.ui.getCore().byId("inputGender").setValueState(sap.ui.core.ValueState.None);
			}	
			
			return validated;

		},
		
	});
});
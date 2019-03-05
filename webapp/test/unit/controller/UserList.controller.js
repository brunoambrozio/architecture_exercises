/*global QUnit*/

sap.ui.define([
	"com/exercise/user/EX_USER_UI5_TO_SAP/controller/UserList.controller"
], function (oController) {
	"use strict";

	QUnit.module("UserList Controller");

	QUnit.test("I should test the UserList controller", function (assert) {
		var oAppController = new oController();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
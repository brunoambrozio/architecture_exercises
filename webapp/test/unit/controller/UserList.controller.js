/*global QUnit*/

sap.ui.define([
	"com/exercise/user/EX_USER_UI5_TO_HANA/controller/UserList.controller"
], function (Controller) {
	"use strict";

	QUnit.module("UserList Controller");

	QUnit.test("I should test the UserList controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
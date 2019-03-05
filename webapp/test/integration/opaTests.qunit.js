/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/exercise/user/EX_USER_UI5_TO_SAP/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});
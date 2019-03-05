/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/exercise/user/EX_USER_UI5_TO_HANA/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});
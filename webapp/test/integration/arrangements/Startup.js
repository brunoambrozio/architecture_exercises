sap.ui.define([
	"sap/ui/test/Opa5"
], function (Opa5) {
	"use strict";

	return Opa5.extend("com.exercise.user.EX_USER_UI5_TO_SAP.test.integration.arrangements.Startup", {

		iStartMyApp: function (oOptions) {
			oOptions = oOptions || {};

			// start the app with a minimal delay to make tests fast but still async to discover basic timing issues
			oOptions.delay = oOptions.delay || 50;

			// start the app UI component
			this.iStartMyUIComponent({
				componentConfig: {
					name: "com.exercise.user.EX_USER_UI5_TO_SAP",
					async: true
				},
				hash: oOptions.hash,
				autoWait: oOptions.autoWait
			});
		}
	});
});
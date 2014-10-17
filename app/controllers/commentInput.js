var parameters = arguments[0] || {};
var currentPhoto = parameters.photo || {};
var parentController = parameters.parentController || {};
var callbackFunction = parameters.callback || null;

OS_IOS && $.saveButton.addEventListener("click", handleButtonClicked);
OS_IOS && $.cancelButton.addEventListener("click", handleButtonClicked);

// EVENT HANDLERS
function handleButtonClicked(_event) {
	// set default to false
	var returnParams = {
		success : false,
		content : null
	};

	// if saved, then set properties
	if (_event.source.id === "saveButton") {
		returnParams = {
			success : true,
			content : $.commentContent.value
		};
	}

	// return to comment.js controller to add new comment
	callbackFunction && callbackFunction(returnParams);

}

function doOpen() {

	if (OS_ANDROID) {

		$.getView().activity.onCreateOptionsMenu = function(_event) {

			var activity = $.getView().activity;
			var actionBar = $.getView().activity.actionBar;

			if (actionBar) {
				actionBar.displayHomeAsUp = true;
				actionBar.onHomeIconItemSelected = function() {
					$.getView().close();
				};
			} else {
				alert("No Action Bar Found");
			}

			// add the button to the titlebar
			var mItemSave = _event.menu.add({
				id : "saveButton",
				title : "Save Comment",
				showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
				icon : Ti.Android.R.drawable.ic_menu_save
			});

			// add save menu item
			mItemSave.addEventListener("click", function(_event) {
				_event.source.id = "saveButton";
				handleButtonClicked(_event);
			});

			var mItemCancel = _event.menu.add({
				id : "cancelButton",
				title : "Cancel",
				showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
				icon : Ti.Android.R.drawable.ic_menu_close_clear_cancel
			});

			// add cancel menu item
			mItemCancel.addEventListener("click", function(_event) {
				_event.source.id = "cancelButton";
				handleButtonClicked(_event);
			});
		};
	}

	// set focus to the text input field, but
	// use set time out to give window time to draw
	setTimeout(function() {
		$.commentContent.focus();
	}, 400);

};

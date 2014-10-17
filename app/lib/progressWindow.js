var activityIndicator, showingIndicator, activityIndicatorWindow, progressTimeout;
var androidContainer = null;

/**
 *
 * @param {Object} _messageString
 */
exports.showIndicator = function(_messageString, _progressBar) {

  // if adroid, we need a container for progress bar to make
  // it more visible
  if (OS_ANDROID) {
    androidContainer = Ti.UI.createView({
      top : "200dp",
      width : Ti.UI.FILL,
      height : Ti.UI.SIZE,
      opacity : 1.0,
      backgroundColor : 'black',
      color : 'black',
      visible : true
    });
  }

  activityIndicatorWindow = Titanium.UI.createWindow({
    top : 0,
    left : 0,
    width : "100%",
    height : "100%",
    backgroundColor : "#58585A",
    opacity : .7,
    fullscreen : true
  });

  if (_progressBar === true) {
    // adjust spacing, size and color based on platform
    activityIndicator = Ti.UI.createProgressBar({
      style : OS_IOS && Titanium.UI.iPhone.ProgressBarStyle.PLAIN,
      top : ( OS_IOS ? "200dp" : '10dp'),
      bottom : ( OS_ANDROID ? '10dp' : undefined),
      left : "30dp",
      right : "30dp",
      min : 0,
      max : 1,
      value : 0,
      message : _messageString || "Loading, please wait.",
      color : "white",
      font : {
        fontSize : '20dp',
        fontWeight : "bold"
      },
      opacity : 1.0,
      backgroundColor : ( OS_ANDROID ? 'black' : 'transparent')
    });
  } else {
    activityIndicator = Ti.UI.createActivityIndicator({
      style : OS_IOS ? Ti.UI.iPhone.ActivityIndicatorStyle.BIG : Ti.UI.ActivityIndicatorStyle.BIG,
      top : "10dp",
      right : "30dp",
      bottom : "10dp",
      left : "30dp",
      message : _messageString || "Loading, please wait.",
      color : "white",
      font : {
        fontSize : '20dp',
        fontWeight : "bold"
      },
      // style : 0
    });
  }

  // if android, you need to account for container when
  // setting up window for display
  if (OS_ANDROID) {
    androidContainer.add(activityIndicator);
    activityIndicatorWindow.add(androidContainer);
    activityIndicatorWindow.open();
  } else {
    activityIndicatorWindow.add(activityIndicator);
    activityIndicatorWindow.open();
  }

  activityIndicator.show();
  showingIndicator = true;

  // safety catch all to ensure the screen eventually clears
  // after 25 seconds
  progressTimeout = setTimeout(function() {
    exports.hideIndicator();
  }, 35000);
};

exports.setProgressValue = function(_value) {
  activityIndicator && activityIndicator.setValue(_value);
};

/**
 *
 */
exports.hideIndicator = function() {

  if (progressTimeout) {
    clearTimeout(progressTimeout);
    progressTimeout = null;
  }

  if (!showingIndicator) {
    return;
  }

  activityIndicator.hide();

  // if android, you need to account for container when
  // cleaning up window
  if (OS_ANDROID) {
    androidContainer.remove(activityIndicator);
    activityIndicatorWindow.remove(androidContainer);
    androidContainer = null;
  } else {
    activityIndicator && activityIndicatorWindow.remove(activityIndicator);
  }
  activityIndicatorWindow.close();
  activityIndicatorWindow = null;

  // clean up variables
  showingIndicator = false;
  activityIndicator = null;
};


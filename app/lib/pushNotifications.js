var Cloud = require('ti.cloud');
var AndroidPush = OS_ANDROID ? require('ti.cloudpush') : null;

/**
 *
 * @param {Object} _user
 * @param {Function} _pushRcvCallback
 * @param {Function} _callback
 */
exports.initialize = function(_user, _pushRcvCallback, _callback) {

  USER_ID = _user.get("id");

  if (Ti.Platform.model === 'Simulator') {
    alert("Push ONLY works on Devices!");
    return;
  }

  // only register push if we have a user logged in
  var userId = _user.get("id");

  if (userId) {

    if (OS_ANDROID) {
      // reset any settings
      AndroidPush.clearStatus();

      // set some properties
      AndroidPush.debug = true;
      AndroidPush.showTrayNotificationsWhenFocused = true;

      AndroidPush.retrieveDeviceToken({
        success : function(_data) {
          Ti.API.debug("recieved device token", _data.deviceToken);

          // what to call when push is received
          AndroidPush.addEventListener('callback', _pushRcvCallback);

          // set some more properties
          AndroidPush.enabled = true;
          AndroidPush.focusAppOnPush = false;

          pushRegisterSuccess(userId, _data, function(_response) {
            // save the device token locally
            Ti.App.Properties.setString('android.deviceToken', _data.deviceToken);

            _callback(_response);
          });
        },
        error : function(_data) {
          AndroidPush.enabled = false;
          AndroidPush.focusAppOnPush = false;
          AndroidPush.removeEventListener('callback', _pushRcvCallback);

          pushRegisterError(_data, _callback);
        }
      });

    } else {
      Ti.Network.registerForPushNotifications({
        types : [Ti.Network.NOTIFICATION_TYPE_BADGE, Ti.Network.NOTIFICATION_TYPE_ALERT, Ti.Network.NOTIFICATION_TYPE_SOUND],
        success : function(_data) {
          pushRegisterSuccess(userId, _data, _callback);
        },
        error : function(_data) {
          pushRegisterError(_data, _callback);
        },
        callback : function(_data) {
          // what to call when push is recieved
          _pushRcvCallback(_data.data);
        }
      });
    }
  } else {
    _callback && _callback({
      success : false,
      msg : 'Must have User for Push Notifications',
    });
  }
};

exports.subscribe = function(_channel, _token, _callback) {
  Cloud.PushNotifications.subscribe({
    channel : _channel,
    device_token : _token,
    type : OS_IOS ? 'ios' : 'android'
  }, function(_event) {

    var msgStr = "Subscribed to " + _channel + " Channel";
    Ti.API.debug(msgStr + ': ' + _event.success);

    if (_event.success) {
      _callback({
        success : true,
        error : null,
        msg : msgStr
      });

    } else {
      _callback({
        success : false,
        error : _event.data,
        msg : "Error Subscribing to All Channels"
      });
    }
  });
};

function pushRegisterError(_data, _callback) {
  _callback && _callback({
    success : false,
    error : _data
  });
}

/**
 *
 * @param {String} _userId
 * @param {Object} _data
 * @param {Function} _callback
 */
function pushRegisterSuccess(_userId, _data, _callback) {

  var token = _data.deviceToken;

  // clean up any previous registration of this device using saved
  // device token
  Cloud.PushNotifications.unsubscribe({
    device_token : Ti.App.Properties.getString('android.deviceToken'),
    user_id : _userId,
    type : (OS_ANDROID) ? 'android' : 'ios'
  }, function(e) {

    exports.subscribe("friends", token, function(_resp1) {

      // if successful subscribe to the platform specific channel
      if (_resp1.success) {

        _callback({
          success : true,
          msg : "Subscribe to channel: friends",
          data : _data,
        });
      } else {
        _callback({
          success : false,
          error : _resp2.data,
          msg : "Error Subscribing to channel: friends"
        });
      }
    });
  });
}

exports.pushUnsubscribe = function(_data, _callback) {

  Cloud.PushNotifications.unsubscribe(_data, function(e) {
    if (e.success) {
      Ti.API.debug('Unsubscribed from: ' + _data.channel);
      _callback({
        success : true,
        error : null
      });
    } else {
      Ti.API.error('Error unsubscribing: ' + _data.channel);
      Ti.API.error(JSON.stringify(e, null, 2));
      _callback({
        success : false,
        error : e
      });
    }
  });
};

exports.sendPush = function(_params, _callback) {

  if (Alloy.Globals.pushToken === null) {
    _callback({
      success : false,
      error : "Device Not Registered For Notifications!"
    });
    return;
  }

  // set the default parameters, send to
  // user subscribed to friends channel
  var data = {
    channel : 'friends',
    payload : _params.payload,
  };

  // add optional parameter to determine if should be sent to all
  // friends or to a specific friend
  _params.friends && (data.friends = _params.friends);
  _params.to_ids && (data.to_ids = _params.to_ids);

  Cloud.PushNotifications.notify(data, function(e) {
    if (e.success) {
      // it worked
      _callback({
        success : true
      });
    } else {
      var eStr = (e.error && e.message) || JSON.stringify(e);
      Ti.API.error(eStr);
      _callback({
        success : false,
        error : eStr
      });
    }
  });
};

exports.getChannels = function(_user, _callback) {

  var xhr = Ti.Network.createHTTPClient();

  // create the url with params

  // get the environment specific Key
  var isProduction = Titanium.App.deployType === "production";
  var acsKeyName = "acs-api-key-" + ( isProduction ? "production" : "development");

  // construct the URL
  var url = "https://api.cloud.appcelerator.com/v1/push_notification/query.json?key=";
  url += Ti.App.Properties.getString(acsKeyName);
  url += "&user_id=" + _user.id;

  xhr.open("GET", url);
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.onerror = function(e) {
    alert(e);
    Ti.API.info(" " + String(e));
  };
  xhr.onload = function() {
    try {
      Ti.API.debug(" " + xhr.responseText);
      var data = JSON.parse(xhr.responseText);
      var subscriptions = data.response.subscriptions[0];
      Ti.API.info(JSON.stringify(subscriptions));

      _callback && _callback({
        success : true,
        data : subscriptions,
      });
    } catch(E) {
      Ti.API.error(" " + String(E));

      _callback && _callback({
        success : false,
        data : null,
        error : E
      });
    }
  };

  xhr.send();
};


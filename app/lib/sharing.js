// if facebook not loaded, then load it
if (!Alloy.Globals.FB) {
  Alloy.Globals.FB = require('facebook');
}
// get the app id
Alloy.Globals.FB.appid = Ti.App.Properties.getString("ti.facebook.appid");

// Enabling single sign on using FB
Alloy.Globals.FB.forceDialogAuth = false;

function checkPermissions(_permissions, _callback) {
  var FB = Alloy.Globals.FB;
  var query = "SELECT " + _permissions + " FROM permissions WHERE uid = me()";
  FB.request("fql.query", {
    query : query
  }, function(resp) {
    try {
      resp.result = JSON.parse(resp.result);
      Ti.API.debug('checkPermissions - resp: ' + JSON.stringify(resp, null, 2));
      _callback(resp);
    } catch (e) {
      _callback(resp);
    }
  });
};

function prepForFacebookShare(_callback) {

  Ti.API.info('prepForFacebookShare');

  var FB = Alloy.Globals.FB;

  var loginCB = function(e) {
    if (e.success) {
      prepForFacebookShare(_callback);
    } else if (e.error) {
      alert(e.error);
      _callback(false);
    }
    // remove event listener now that we are done
    FB.removeEventListener('login', loginCB);
    return;
  };

  // if not logged in then log user in and then try again
  if (FB.loggedIn === false) {
    FB.addEventListener('login', loginCB);
    FB.authorize();
  } else {

    // First make sure this permission exists for user
    checkPermissions('publish_stream', function(_response) {
      var hasPermission = (_response.result[0].publish_stream === 1);
      if (_response.success && hasPermission) {
        _callback(true);
      } else {
        // if not try and get the permission
        FB.reauthorize(['publish_stream'], 'me', function(e) {
          if (e.success) {
            _callback(true);
          } else {
            alert('Authorization failed: ' + e.error);
            _callback(false);
          }
        });
      }
    });
  }
}

exports.prepForFacebookShare = prepForFacebookShare;

function shareWithFacebookDialog(_model) {

  var data = {
    link : _model.attributes.urls.original,
    name : "tiGram Wiley Sample App",
    message : " ACS Alloy Sample App and the photo",
    caption : _model.attributes.title,
    picture : _model.attributes.urls.preview,
    description : "None"
  };

  Alloy.Globals.FB.dialog("feed", data, function(e) {
    if (e.success && e.result) {
      alert("Success!");
    } else {
      if (e.error) {
        alert(e.error);
      } else {
        alert("User canceled dialog.");
      }
    }
  });
}

function shareFacebookPhoto(_model) {

  var dataModel = _model.attributes;
  var message;

  // get image as blob, null passed for _path
  downloadFile(dataModel.urls.original, null, function(_data) {

    if (_data.success === false) {
      alert("Error downloading file for sharing");
      return;
    }

    message = dataModel.title;
    message += "\nfrom ACS & Alloy Sample App";

    var data = {
      message : message,
      picture : _data.blob,
    };

    Alloy.Globals.PW.showIndicator("Uploading File to Facebook", false);

    // Now post the downloaded photo
    Alloy.Globals.FB.requestWithGraphPath('me/photos', data, 'POST', function(e) {
      Alloy.Globals.PW.hideIndicator();
      if (e.success) {
        alert("Success! From Facebook: ");
      } else {
        if (e.error) {
          alert('Error Posting Photo to Album ' + e.error);
        } else {
          alert("Unknown result");
        }
      }

    });
  });
};
function shareWithEmailDialog(_model) {

  var dataModel = _model.attributes;

  var emailDialog = Ti.UI.createEmailDialog({
    html : true
  });

  if (emailDialog.isSupported() === false) {
    alert("Email is not configured for this device");
    return;
  }

  emailDialog.subject = " Wiley ACS & Alloy Sample App";
  emailDialog.messageBody = '<html>' + dataModel.title + '<br/>';
  emailDialog.messageBody += '<a href="' + dataModel.urls.original;
  emailDialog.messageBody += '">Link to original image</a>';
  emailDialog.messageBody += '</html>';

  downloadFile(_model.attributes.urls.original, "temp.jpeg", function(_data) {

    if (_data.success === false) {
      alert("Error downloading file\n Image not shared!");
      return;
    }

    var f = Ti.Filesystem.getFile(_data.nativePath);
    emailDialog.addAttachment(f);

    emailDialog.addEventListener("complete", function(_event) {
      if (_event.result === emailDialog.SENT) {
        alert('Message Successfully Sent!');
      }
    });

    emailDialog.open();

  });
}

function shareTwitterPhoto(_model) {
  var dataModel = _model.attributes;

  var twitter = Alloy.Globals.TW;

  downloadFile(dataModel.urls.iphone, null, function(_data) {

    if (_data.success === false) {
      alert("error downloading file");
      return;
    }
    twitter.shareImage({
      message : dataModel.title + " #tialloy",
      image : _data.blob,
      success : function() {
        alert('Tweeted successfully!');
      },
      error : function() {
        alert('Unable to post your tweet.');
      }
    });
  },
  // update the ui progress indicator
  function(e) {
    progressIndicator && (progressIndicator.value = e.progress);
  });
}

function downloadFile(url, _path, _callback) {
  Alloy.Globals.PW.showIndicator("Downloading File", true);
  _path && Ti.API.debug("downloading " + url + "  as " + _path);

  var f, fd, http;

  http = Ti.Network.createHTTPClient({
    ondatastream : function(e) {
      // update the caller with information on download
      if (e.progress > 0) {
        Alloy.Globals.PW.setProgressValue && Alloy.Globals.PW.setProgressValue(e.progress);
      }
    }
  });

  http.open("GET", url);

  http.onload = function() {

    if (_path) {
      if (Ti.Filesystem.isExternalStoragePresent()) {
        fd = Ti.Filesystem.externalStorageDirectory;
      } else {
        // No SD or iOS
        fd = Ti.Filesystem.applicationDataDirectory;
      }

      // get the file
      f = Ti.Filesystem.getFile(fd, _path);

      // delete if already exists
      if (f.exists()) {
        f.deleteFile();
        f = Ti.Filesystem.getFile(fd, _path);
      }

      // write blob to file
      f.write(http.responseData);
      Alloy.Globals.PW.hideIndicator();

      _callback && _callback({
        success : true,
        nativePath : f.nativePath
      });

    } else {
      Alloy.Globals.PW.hideIndicator();
      // if no path, the just return the blob
      _callback && _callback({
        success : true,
        nativePath : null,
        blob : http.responseData
      });
    }

  };
  // if error return information
  http.onerror = function(e) {
    Alloy.Globals.PW.hideIndicator();
    _callback && _callback({
      success : false,
      nativePath : null,
      error : e
    });

  };

  http.send();
};

exports.sharingOptions = function(_options) {

  var dialog, params;

  if (OS_ANDROID) {
    params = {
      options : ['Facebook Feed', 'Facebook Photo', 'Twitter', 'Email'],
      buttonNames : ['Cancel'],
      title : 'Share Photo'
    };
  } else {
    params = {
      options : ['Facebook Feed', 'Facebook Photo', 'Twitter', 'Email', 'Cancel'],
      cancel : 4,
      title : 'Share Photo'
    };
  }

  dialog = Titanium.UI.createOptionDialog(params);
  // add event listener
  dialog.addEventListener('click', function(e) {

    // user clicked cancel
    if (OS_ANDROID && e.button) {
      return;
    }

    if (e.index === 0) {
      prepForFacebookShare(function() {
        shareWithFacebookDialog(_options.model);
      });
    } else if (e.index === 1) {
      prepForFacebookShare(function() {
        shareFacebookPhoto(_options.model);
      });
    } else if (e.index === 2) {
      shareTwitterPhoto(_options.model);
    } else if (e.index === 3) {
      shareWithEmailDialog(_options.model);
    }
  });

  // show the dialog
  dialog.show();

};

/**
 * logs out and clears out any social media information
 */
exports.deauthorize = function() {
  Alloy.Globals.TW && Alloy.Globals.TW.deauthorize();
  Alloy.Globals.FB && Alloy.Globals.FB.logout();
};

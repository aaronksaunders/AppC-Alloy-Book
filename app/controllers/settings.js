/* EVENT HANDLERS */
/* in IOS we need to support the button click */
OS_IOS && $.logoutBtn.addEventListener("click", handleLogoutBtnClick);

/* listen for click on image to uplaod upload a new one */
$.profileImage.addEventListener("click", handleProfileImageClick);

/* listen for close event to do some clean up */
$.getView().addEventListener("close", closeWindowEventHandler);

/* listen for Android back event to do some clean up */
$.getView().addEventListener("androidback", androidBackEventHandler);

/* keep state of friends connections */
$.connectedToFriends = false;

/* keep state of initialization, this prevents the events from looping */
$.onSwitchChangeActive = false;

/* social media set to false at initialization */
$.twitterBtn.value = false;
$.facebookBtn.value = false;

/* listen for click on refreshBtn to refresh data */
$.refreshBtn.addEventListener("click", loadProfileInformation);

/* push notifications */
var pushLib = require('pushNotifications');



$.handleLogoutMenuClick = function(_event) {
  handleLogoutBtnClick(_event);
};

function handleLogoutBtnClick(_event) {

  // push logout
  require('pushNotifications').logout(function() {

    Alloy.Globals.currentUser.logout(function(_response) {
      if (_response.success) {
        Ti.API.debug('user logged out');

        // clear any twitter/FB information
        require('sharing').deauthorize();

        // show login window
        $.parentController.userNotLoggedInAction();

      } else {
        Ti.API.error('error logging user out');
      }
    });
  });
};

function handleProfileImageClick() {
  var dopts = {
    options : ['Take Photo', 'Open Photo Gallery'],
    title : 'Pick Photo Source'
  };

  if (OS_IOS) {
    dopts.options.push('Cancel');
    dopts.cancel = dopts.options.length - 1;
  } else {
    dopts.buttonNames = ['Cancel'];
  }
  var optionDialog = Ti.UI.createOptionDialog(dopts);

  optionDialog.addEventListener('click', function(e) {
    var options = {
      success : processPhoto,
      cancel : function() {
      },
      error : function(e) {
        Ti.API.error(JSON.stringify(e));
      },
      allowEditing : true,
      mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO],
    };
    if (e.button) {
      return;
    } else if (e.index == 0) {
      Ti.Media.showCamera(options);
    } else if (e.index == 1) {
      Ti.Media.openPhotoGallery(options);
    }
  });

  optionDialog.show();
}

function processPhoto(_event) {

  Alloy.Globals.PW.showIndicator("Saving Image", false);
  var ImageFactory = require('ti.imagefactory');

  if (OS_ANDROID || _event.media.width > 700) {
    var w, h;
    w = _event.media.width * .50;
    h = _event.media.height * .50;
    $.currentUserCustomPhoto = ImageFactory.imageAsResized(_event.media, {
      width : w,
      height : h
    });
  } else {
    // we do not need to compress here
    $.currentUserCustomPhoto = _event.media;
  }

  Alloy.Globals.currentUser.save({
    "photo" : $.currentUserCustomPhoto,
    "photo_sizes[thumb_100]" : "100x100#",
    // We need this since we are showing the image immediately
    "photo_sync_sizes[]" : "thumb_100",
  }, {
    success : function(_model, _response) {

      // take the cropped thumb and display it
      setTimeout(function() {

        // give ACS some time to process image then get
        // updated user object
        Alloy.Globals.currentUser.showMe(function(_resp) {
          Alloy.Globals.PW.hideIndicator();

          _resp.model && (Alloy.Globals.currentUser = _resp.model);
          if (_resp.model.attributes.photo.processed) {
            $.profileImage.image = _resp.model.attributes.photo.urls.thumb_100;
            alert("Your profile photo has been changed.");
          } else {
            $.profileImage.image = _resp.model.attributes.photo.urls.original;

            alert("Your profile photo has been changed, thumbnail process not complete!");
            // clear out values force refresh on next
            // focus if we still dont have an image
            $.currentUserCustomPhoto = null;
            $.initialized = false;
          }
        });
      }, 3000);
    },
    error : function(error) {
      Alloy.Globals.PW.hideIndicator();
      alert("Error saving your profile " + String(error));
      Ti.API.error(error);
      return;
    }
  });
}

function loadProfileInformation() {

  Alloy.Globals.PW.showIndicator("Loading User Information", false);

  // get the attributes from the current user
  var attributes = Alloy.Globals.currentUser.attributes;
  var currentUser = Alloy.Globals.currentUser;

  // get the push notifications status

  pushLib.getChannels(currentUser, function(_response3) {
    var friendActive;
    if (_response3.success) {
      $.connectedToFriends = (_.contains(_response3.data.channel, "friends") !== -1);
      $.notificationsBtn.value = $.connectedToFriends;
    } else {
      $.notificationsBtn.value = $.connectedToFriends = false;
    }
  });

  // set the user profile photo
  if ($.currentUserCustomPhoto) {
    $.profileImage.image = $.currentUserCustomPhoto;
  } else if (attributes.photo && attributes.photo.urls) {
    $.profileImage.image = attributes.photo.urls.thumb_100 || attributes.photo.urls.original;
  } else if ( typeof (attributes.external_accounts) !== "undefined") {
    $.profileImage.image = 'https://graph.facebook.com/' + attributes.username + '/picture';
  } else {
    Ti.API.debug('no photo using missing gif');
    $.profileImage.image = '/missing.gif';
  }

  // get the name for display
  if (attributes.firstName && attributes.lastName) {
    $.fullname.text = attributes.firstName + " " + attributes.lastName;
  } else {
    $.fullname.text = attributes.username;
  }

  // get the user object from server and the photo count
  currentUser.showMe(function(_response) {
    if (_response.success) {
      $.photoCount.text = _response.model.get("stats").photos.total_count;
    } else {
      alert("Error getting user information");
    }

    // get the friends count
    currentUser.getFriends(function(_response2) {
      if (_response2.success) {
        $.friendCount.text = _response2.collection.length;
      } else {
        alert("Error getting user friend information");
      }

      Alloy.Globals.PW.hideIndicator();
    });
  });

  // load the social media settings
  $.twitterBtn.value = Alloy.Globals.TW.isAuthorized();
  $.facebookBtn.value = Alloy.Globals.FB.getLoggedIn();

  $.onSwitchChangeActive = true;

  setTimeout(function() {
    Alloy.Globals.PW.hideIndicator();
  }, 200);

}

function closeWindowEventHandler(argument) {
}

function androidBackEventHandler(argument) {
}

function onSwitchChange(_event) {

  // dont respond to events until initialization is completed
  if ($.onSwitchChangeActive === false) {
    return;
  }

  $.onSwitchChangeActive = false;

  var selItem = _event.source;
  switch (selItem.id) {
    case "notificationsBtn" :
      if ($.connectedToFriends === true) {
        pushLib.pushUnsubscribe({
          channel : "friends",
          device_token : Alloy.Globals.pushToken
        }, function(_response) {
          if (_response.success) {
            // unsubscribe worked
            selItem.value = $.connectedToFriends = false;
            activateOnSwitchChange();
          }
        });
      } else {
        pushLib.subscribe("friends", Alloy.Globals.pushToken, function(_response) {
          if (_response.success) {
            // subscribe worked
            selItem.value = $.connectedToFriends = true;
            activateOnSwitchChange();
          }
        });
      }

      break;
    case "twitterBtn":
      if (Alloy.Globals.TW.isAuthorized() === false || selItem.value === false) {
        Alloy.Globals.TW.authorize(function(_response) {
          selItem.value = _response.userid ? true : false;
          activateOnSwitchChange();
        });
      } else {
        Alloy.Globals.TW.deauthorize();
        selItem.value = false;
        activateOnSwitchChange();
      }
      break;
    case "facebookBtn":
      if (Alloy.Globals.FB.getLoggedIn() === true ) {
        Alloy.Globals.FB.logout();
        selItem.value = false;
        activateOnSwitchChange();
      } else {
        require('sharing').prepForFacebookShare(function(_success) {
          selItem.value = _success;
          activateOnSwitchChange();
        });
      }
      break;
  }
}

function activateOnSwitchChange() {
  setTimeout(function() {
    $.onSwitchChangeActive = true;
  }, 200);
}


$.getView().addEventListener("focus", function() {
  setTimeout(function() {
    !$.initialized && loadProfileInformation();
    $.initialized = true;
  }, 200);
});

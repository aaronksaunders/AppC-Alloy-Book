var args = arguments[0] || {};
var updating = false;

var push = require('pushNotifications');

// EVENT LISTENERS
// on android, we need the change event not the click event
$.filter.addEventListener( OS_ANDROID ? 'change' : 'click', filterClicked);

$.friendsWindow.addEventListener("androidback", androidBackEventHandler);

/**
 * called when the back button is clicked, we will close the window
 * and stop event from bubble up and closing the app
 *
 * @param {Object} _event
 */
function androidBackEventHandler(_event) {
  _event.cancelBubble = true;
  _event.bubbles = false;
  Ti.API.debug("androidback event");
  $.friendsWindow.removeEventListener("androidback", androidBackEventHandler);
  $.friendsWindow.close();
}

function filterClicked(_event) {
  var itemSelected;
  itemSelected = !OS_ANDROID ? _event.index : _event.rowIndex;

  // clear the ListView display
  $.section.deleteItemsAt(0, $.section.items.length);

  // call the appropriate function to update the display
  switch (itemSelected) {
    case 0 :
      getAllUsersExceptFriends();
      break;
    case 1 :
      loadFriends();
      break;
  }
}

/**
 *
 */
function followBtnClicked(_event) {

  Alloy.Globals.PW.showIndicator("Updating User");

  var currentUser = Alloy.Globals.currentUser;
  var selUser = getModelFromSelectedRow(_event);

  currentUser.followUser(selUser.model.id, function(_resp) {
    if (_resp.success) {

      // update the lists IF it was successful
      updateFollowersFriendsLists(function() {

        // update the UI to reflect the change
        getAllUsersExceptFriends(function() {
          Alloy.Globals.PW.hideIndicator();
          alert("You are now following " + selUser.displayName);

          // send a push notification to the user to let
          // them know they have a new friend
          var currentUser = Alloy.Globals.currentUser;

          push.sendPush({
            payload : {
              custom : {},
              sound : "default",
              alert : "You have a new friend! " + currentUser.get("email")
            },
            to_ids : selUser.model.id,
          }, function(_repsonsePush) {
            if (_repsonsePush.success) {
              alert("Notified user of new friend");
            } else {
              alert("Error notifying user of new friend");
            }
          });

        });

      });

    } else {
      alert("Error trying to follow " + selUser.displayName);
    }
    Alloy.Globals.PW.hideIndicator();

  });

  _event.cancelBubble = true;
};

/**
 *
 */
function getModelFromSelectedRow(_event) {
  var item = _event.section.items[_event.itemIndex];
  var selectedUserId = item.properties.modelId;
  return {
    model : $.friendUserCollection.get(selectedUserId),
    displayName : item.userName.text,
  };
}

function followingBtnClicked(_event) {

  Alloy.Globals.PW.showIndicator("Updating User");

  var currentUser = Alloy.Globals.currentUser;
  var selUser = getModelFromSelectedRow(_event);

  currentUser.unFollowUser(selUser.model.id, function(_resp) {
    if (_resp.success) {

      // update the lists
      updateFollowersFriendsLists(function() {
        Alloy.Globals.PW.hideIndicator();

        // update the UI to reflect the change
        loadFriends(function() {
          Alloy.Globals.PW.hideIndicator();
          alert("You are no longer following " + selUser.displayName);
        });
      });

    } else {
      alert("Error unfollowing " + selUser.displayName);
    }

  });
  _event.cancelBubble = true;
};

/**
 *
 */
function initialize() {
  $.filter.index = 0;

  Alloy.Globals.PW.showIndicator("Loading...");

  updateFollowersFriendsLists(function() {
    Alloy.Globals.PW.hideIndicator();

    // get the users
    $.collectionType = "fullItem";

    getAllUsersExceptFriends();

  });
};

/**
 *
 * @param {Object} _callback
 */
function updateFollowersFriendsLists(_callback) {
  var currentUser = Alloy.Globals.currentUser;

  // get the followers/friends id for the current user
  currentUser.getFollowers(function(_resp) {
    if (_resp.success) {
      $.followersIdList = _.pluck(_resp.collection.models, "id");

      // get the friends
      currentUser.getFriends(function(_resp) {
        if (_resp.success) {
          $.friendsIdList = _.pluck(_resp.collection.models, "id");
        } else {
          alert("Error updating friends and followers");
        }
        _callback();
      });
    } else {
      alert("Error updating friends and followers");
      _callback();
    }

  });
}

function loadFriends(_callback) {
  var user = Alloy.Globals.currentUser;

  Alloy.Globals.PW.showIndicator("Loading Friends...");

  user.getFriends(function(_resp) {
    if (_resp.success) {
      if (_resp.collection.models.length === 0) {
        $.friendUserCollection.reset();
      } else {
        $.collectionType = "friends";
        $.friendUserCollection.reset(_resp.collection.models);
        $.friendUserCollection.trigger("sync");
      }
    } else {
      alert("Error loading followers");
    }
    Alloy.Globals.PW.hideIndicator();
    _callback && _callback();
  });
};

function getAllUsersExceptFriends(_callback) {
  var where_params = null;

  // which template to use when rendering listView
  $.collectionType = "fullItem";

  Alloy.Globals.PW.showIndicator("Loading Users...");

  // remove all items from the collection
  $.friendUserCollection.reset();

  if ($.friendsIdList.length) {
    // set up where parameters using the $.friendsIdList
    // from the updateFollowersFriendsLists function call
    var where_params = {
      "_id" : {
        "$nin" : $.friendsIdList, // means NOT IN
      },
    };
  }

  // set the where params on the query
  $.friendUserCollection.fetch({
    data : {
      per_page : 100,
      order : '-last_name',
      where : where_params && JSON.stringify(where_params),
    },
    success : function() {
      // user collection is updated into
      // $.friendUserCollection variable
      Alloy.Globals.PW.hideIndicator();
      _callback && _callback();
    },
    error : function() {
      Alloy.Globals.PW.hideIndicator();
      alert("Error Loading Users");
      _callback && _callback();
    }
  });
}

function doTransform(model) {

  var displayName, image, user = model.toJSON();

  // get the photo
  if (user.photo && user.photo.urls) {
    image = user.photo.urls.square_75 || user.photo.urls.thumb_100 || user.photo.urls.original || "missing.gif";
  } else {
    image = "missing.gif";
  }

  // get the display name
  if (user.first_name || user.last_name) {
    displayName = (user.first_name || "") + " " + (user.last_name || "");
  } else {
    displayName = user.email;
  }

  // return the object
  var modelParams = {
    title : displayName,
    image : image,
    modelId : user.id,
    template : $.collectionType
  };

  return modelParams;
};

function doFilter(_collection) {
  return _collection.filter(function(_i) {
    var attrs = _i.attributes;
    return ((_i.id !== Alloy.Globals.currentUser.id) && (attrs.admin === "false" || !attrs.admin));
  });
};

$.getView().addEventListener("focus", function() {
  !$.initialized && initialize();
  $.initialized = true;
});


// Get the parameters passed into the controller
var parameters = arguments[0] || {};
var currentPhoto = parameters.photo || {};
var parentController = parameters.parentController || {};

$.image.image = currentPhoto.attributes.urls.preview;
$.titleLabel.text = currentPhoto.attributes.title || '';

// get comment count from object
var count = currentPhoto.attributes.reviews_count !== undefined ? currentPhoto.attributes.reviews_count : 0;

// modify the button title to show the comment count
// if there are comments already associated to photo
if (count !== 0) {
  $.commentButton.title = "Comments (" + count + ")";
}

$.buttonContainer.addEventListener('click', function(_event) {
  // add the model information as data to event
  _event.data = currentPhoto;
  parameters.clickHandler(_event);
});

$.getView().addEventListener("androidback", androidBackEventHandler);

function androidBackEventHandler(_event) {
  _event.cancelBubble = true;
  _event.bubbles = false;
  $.getView().removeEventListener("androidback", androidBackEventHandler);
  $.getView().close();
}

// Set up the menus and actionBar for Android if necessary
$.getView().addEventListener("open", function() {
  OS_ANDROID && ($.getView().activity.onCreateOptionsMenu = function() {
    var actionBar = $.getView().activity.actionBar;
    if (actionBar) {
      actionBar.displayHomeAsUp = true;
      actionBar.onHomeIconItemSelected = function() {
        $.getView().removeEventListener("androidback", androidBackEventHandler);
        $.getView().close();
      };
    }
  });
});

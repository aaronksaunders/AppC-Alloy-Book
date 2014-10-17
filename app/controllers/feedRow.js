var model = arguments[0] || {};
//
// this is setting the view elements of the row view
// based on the arguments passed into the controller
//

$.image.image = model.attributes.urls.preview;
$.titleLabel.text = model.attributes.title || '';

// save the model id for use later in app
debugger;
$.row.row_id = model.id || '';

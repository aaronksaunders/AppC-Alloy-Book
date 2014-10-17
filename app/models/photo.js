exports.definition = {

  config : {

    "adapter" : {
      "type" : "acs",
      "collection_name" : "photos"
    }
  },

  extendModel : function(Model) {
    _.extend(Model.prototype, {

      // extended functions go here

    });
    // end extend

    return Model;
  },

  extendCollection : function(Collection) {
    _.extend(Collection.prototype, {

      // extended functions go here
      /**
       *
       * @param {Object} _user
       * @param {Object} _options
       */
      findMyPhotosAndWhoIFollow : function(_user, _options) {
        var collection = this;

        // get all of the current users friends
        _user.getFriends(function(_resp) {
          if (_resp.success) {

            // pluck the user ids and add current users id
            var idList = _.pluck(_resp.collection.models, "id");
            idList.push(_user.id);

            // set up where parameters using the user list
            var where_params = {
              "user_id" : {
                "$in" : idList
              },
              title : {
                "$exists" : true
              }
            };
            // set the where params on the query
            _options.data = _options.data || {};
            _options.data.order = '-created_at';
            _options.data.per_page = 25;
            _options.data.where = JSON.stringify(where_params);

            // execute the query
            collection.fetch(_options);
          } else {
            Ti.API.error('Error fetching friends');
            _options.error();
          }
        });
      },
      /**
       *
       * @param {Object} _user
       * @param {Object} _location
       * @param {Object} _distance
       * @param {Object} _options
       */
      findPhotosNearMe : function(_user, _location, _distance, _options) {
        var collection = this;

        // convert distance to radians if provided
        var distance = _distance ? (_distance / 3959) : 0.00126;

        if (_location === null) {
          _options.error("Could Not Find Photos");
          return;
        }
        // get all of the current users friends
        _user.getFriends(function(_resp) {
          if (_resp.success) { debugger;

            var idList = _.pluck(_resp.collection.models, "id");
            idList.push(_user.id);

            // first we get the current location
            var coords = [];
            coords.push(_location.coords.longitude);
            coords.push(_location.coords.latitude);

            // set up where parameters
            var where_params = {
              "user_id" : {
                "$in" : idList
              },
              "coordinates" : {
                "$nearSphere" : coords,
                "$maxDistance" : distance // 5 miles in
                // radians
              }
            };
            // set the where params on the query
            _options.data = _options.data || {};
            _options.data.per_page = 25;
            _options.data.where = JSON.stringify(where_params);

            // execute the query
            collection.fetch(_options);
          } else {
            _options.error("Could Not Find Photos");
            return;
          }
        });
      }
    });
    // end extend

    return Collection;
  },
};

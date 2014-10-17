exports.definition = {

	config : {

		"adapter" : {
			"type" : "acs",
			"collection_name" : "friends"
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

		});
		// end extend

		return Collection;
	},
};

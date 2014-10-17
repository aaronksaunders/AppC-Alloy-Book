exports.definition = {

    config : {
        "adapter" : {
            "type" : "acs",
            "collection_name" : "reviews"
        }
    },

    extendModel : function(Model) {
        _.extend(Model.prototype, {});
        return Model;
    },

    extendCollection : function(Collection) {
        _.extend(Collection.prototype, {});
        return Collection;
    },
};

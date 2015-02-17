
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello Ryan!");
});


Parse.Cloud.define("addRestaurantItem", function(request, response) {

    var MenuItem = Parse.Object.extend("RestaurantItem");
    var item = new MenuItem();

    item.save( {
        itemName: request.params.itemName,
        itemCost: request.params.itemCost,
        itemDescription: request.params.itemDescription
    }, {
        success: function(item) {
            response.success();
            console.log("Successful save");
        },
        error: function(item, error) {
            response.error(error);
            console.log("Failure");
        }
    });
});

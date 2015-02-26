
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello Ryan!");
});

Parse.Cloud.define("addRestaurant", function(request, response) {

    var RestaurantObject = Parse.Object.extend("Restaurant");
    var newRestaurant = new RestaurantObject();

    var MenuItem = Parse.Object.extend("RestaurantItem");
    var menuArray = [];

    var menu = request.params.restaurantMenu.menu;
    var restaurantName = request.params.restaurantName;

    for(var i = 0; i < menu.length; i++) {
        var item = new MenuItem();
        item.save({restaurantOwner:restaurantName, itemName:menu[i].name, itemCost:menu[i].price, itemDescription:menu[i].description});
        menuArray.push(item);
    }


    newRestaurant.save( {
        restaurantName: request.params.restaurantName,
        restaurantMenu: menuArray//menu
        }, {
        success: function(item) {
            response.success();
            console.log("Successful save");
        },
        error: function(item, error) {
            response.error(error);
        }
        });
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

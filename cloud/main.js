function getUser(userObjectId) {
    Parse.Cloud.useMasterKey();

    var userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo("phoneNumber", "6099154930");

    return userQuery.first({
        success: function(userRetrieved) {
            console.log("We have");
            userRetrieved.fetch();
            console.log("Got: " + userRetrieved.name);
            return userRetrieved;
        }
        ,
        error: function(error) {
            return error;
        }
    });
};

Parse.Cloud.define("placeOrder", function(request, response) {

    var NewOrderClass = Parse.Object.extend("Order");
    var newOrder = new NewOrderClass();

    var restaurantQuery = new Parse.Query("Restaurant");
    restaurantQuery.equalTo("restaurantName", request.params.restaurantName);

    restaurantQuery.first({
        success: function(restaurant) {
            newOrder.save({
                success: function(success) { 
                    newOrder.set("orderedBy", request.user);
                    newOrder.set("restaurantName", request.params.restaurantName);        
                    newOrder.set("ordererName", request.params.ordererName);
                    newOrder.set("deliveryAddress", request.params.deliveryAddress);
                    newOrder.set("orderStatus", 0);
                    newOrder.set("timeToBeDeliveredAt", request.params.timeToDeliverAt);
                    newOrder.set("chosenItems", request.params.chosenItems);
                    newOrder.relation("restaurantFrom").add(restaurant);

                    newOrder.save();
                    response.success("Success!");
                },
                error: function(error) {
                    console.log(error);
                    response.error("Error making new order");
                }
            });

        }, error: function(error) {
            console.log(error);
            response.error("Error making new order");
        }
    });
});

//Returns restaurants --> Will be modified to only return opened ones
Parse.Cloud.define("getRestaurants", function(request, response) {

    var query = new Parse.Query("Restaurant");

    query.find( {
        success: function(results) {
            var openRestaurants = [];

            for(var i = 0; i < results.length; i++) {

                var restaurantObj = results[i];//.get("restaurantName"); //{}

                openRestaurants.push(restaurantObj);
            }

            response.success(openRestaurants);
        },
        error: function() {
            response.error("Error getting open restaurants");
        }
    });
});


//Returns true/false if successful login
Parse.Cloud.define("login", function(request, response) {

    var username = request.params.username;
    var password = request.params.password;

    var query = new Parse.Query("BMFUser");
    query.equalTo("phoneNumber", username);

    query.find( {
        success: function(results) { 
            for(var i = 0; i < results.length; i++) { 
                if(results[i].get("encryptedPassword") === password) {
                    response.success("YES");
                    return;
                }
            }

            response.success("NO");
        },
        error: function() {
            response.error("Error finding restaurants matching name");
        }
    });
});

function userExists(phoneNumber) {
    var query = new Parse.Query("BMFUser");
    query.equalTo("phoneNumber", phoneNumber);

    query.find( {
        success: function(results) {
            if(results.length > 0) {
                return false;
            }
            else {
                return true;
            }
        }, 
        error: function() {
            return true;
        }
    });
};

//Create an account (verifies no duplicate accounts are made and all fields are satisfied)
Parse.Cloud.define("createAccount", function(request, response) {

    var name = request.params.name;
    var phoneNumber = request.params.phoneNumber;
    var password = request.params.password;
    var emailAddress = request.params.emailAddress;

    //Check to make sure there are no other usernames
    if(userExists(phoneNumber)) {
        response.success("EXISTS");
    }

    var BMFUser = Parse.Object.extend("BMFUser");
    var newUser = new BMFUser();
    newUser.save({ 
        "name":name,
        "emailAddress": emailAddress,
        "phoneNumber": phoneNumber,
        "encryptedPassword": password
    }, {
        success: function(item) {
            response.success("CREATED");
        },
        error: function(item, error) {
            response.error(error);
        }
    });
});


//Returns a JSONArray of MenuItems for the entered restaurant
Parse.Cloud.define("getMenuItems", function(request, response) {

    //Name of the retaurant
    var restaurantName = request.params.restaurantName;

    var query = new Parse.Query("RestaurantItem");

    query.equalTo("restaurantOwner", restaurantName);

    query.find( {
        success: function(results) { 

            var result = [];

            for(var i = 0; i < results.length; i++) { 
                var restaurantItem = {
                    "restaurantName": results[i].get("restaurantOwner"),
                    "itemName": results[i].get("itemName"),
                    "price": results[i].get("itemCost"),
                    "itemDescription": results[i].get("itemDescription")
                };
                result.push(restaurantItem);
                console.log("Parsing: " + results[i].get("itemName"));
            }

            response.success(result);
        }, 
        error: function() {
            response.error("Error finding restaurants matching name");
        }
    });
});

//Adds a restaurant
Parse.Cloud.define("addRestaurant", function(request, response) {

    //A Restaurant class
    var RestaurantObject = Parse.Object.extend("Restaurant");
    var newRestaurant = new RestaurantObject();

    //A RestaurantItem class
    var MenuItem = Parse.Object.extend("RestaurantItem");

    //To hold the menu items
    var menuArray = [];

    //Short form for referring to the array of menu items
    var menu = request.params.restaurantMenu.menu;

    //The name of the restaurant
    var restaurantName = request.params.restaurantName;

    //Go through all the menu items
    for(var i = 0; i < menu.length; i++) {

        //Create a new menu item
        var item = new MenuItem();

        //Save the information
        item.save({restaurantOwner:restaurantName, itemName:menu[i].name, itemCost:menu[i].price, itemDescription:menu[i].description});

        //Add it to the array
        menuArray.push(item);
    }

    //Save the restaurant with the menu
    newRestaurant.save({restaurantName: restaurantName, restaurantMenu: menuArray}, {
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

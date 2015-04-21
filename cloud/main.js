Parse.Cloud.define("getDriverLocation", function(request, response) {

    var orderID = request.params.orderID;

    var query = Parse.Query("Order");
    query.equalTo("objectId", orderID);

    query.find({
        success: function(order) {
            var driver = order.get("driver");
            var driverLocation = driver.get("currentLocation");

            var restaurantLocation = order.get("restaurantLocation");
            var deliveryLocation = order.get("deliveryAddress");

            var results = {
                "driverLocation": driverLocation,
                "restaurantLocation": restaurantLocation,
                "deliveryLocation": deliveryLocation
            };

            response.success(results);

        }, error: function(error) {
            response.error(error);
        }
    });
});

//Returns all unclaimed orders
Parse.Cloud.define("getUnclaimedOrders", function(request, response) {

    var query = new Parse.Query("Order");
    query.equalTo("orderStatus", 0);

    query.find({
        success: function(results) {
            var orders = [];

            for(var i = 0; i < results.length; i++) {
                var order = {
                    "orderID": results[i].id,
                    "restaurantName": results[i].get("restaurantName"),
                    "deliveryAddressString": results[i].get("deliveryAddressString"),
                    "timeToBeDeliveredAt": results[i].get("timeToBeDeliveredAt"),
                    "deliveryAddress": results[i].get("deliveryAddress"),
                    "orderCost": results[i].get("orderCost"),
                    "restaurantGeoPoint": results[i].get("restaurantLocation")

                };
                orders.push(order);
            }

            response.success(orders);

        }, error: function(error) {
            console.log("ERROR GETTING UNCLAIMED ORDERS");
            response.error(error);
        }
    });
});

Parse.Cloud.define("setDriverLocation", function(request, response) {

    var driverID = Parse.User.current().id;

    var query = new Parse.Query(Parse.User);
    query.equalTo('objectId', driverID);

    query.first().then(function(driver) {    
        driver.set("currentLocation", request.params.currentLocation);
        driver.save();

        response.success("YES");
    });
});

Parse.Cloud.define("getDriversOrders", function(request, response) {

    var query = new Parse.Query("Order");
    query.equalTo('driver', Parse.User.current());

    query.find({
        success: function(results) {

            var orders = [];

            for(var i = 0; i < results.length; i++) {

                var order = {
                    "orderID": results[i].id,
                    "deliveryAddress": results[i].get("deliveryAddress"),
                    "deliveryAddressString": results[i].get("deliveryAddressString"),
                    "estimatedDeliveryTime": results[i].get("estimatedDeliveryTime"),
                    "orderCost": results[i].get("orderCost"),
                    "orderStatus": results[i].get("orderStatus"),
                    "ordererName": results[i].get("ordererName"),
                    "ordererPhoneNumber": results[i].get("ordererPhoneNumber"),
                    "restaurantLocation": results[i].get("restaurantLocation"),
                    "restaurantName": results[i].get("restaurantName"),
                    "timeToBeDeliveredAt": results[i].get("timeToBeDeliveredAt"),
                    "additionalDetails": results[i].get("additionalDetails"),
                    "chosenItems": results[i].get("chosenItems")
                };

                orders.push(order);
            }

            response.success(orders);

        }, error: function(error) {
            response.error(error);
        }
    });
});


//Claims an order
Parse.Cloud.define("claimOrder", function(request, response) {

    var estimatedDeliveryTime = request.params.estimatedDeliveryTime;
    var orderId = request.params.orderId;
    var driver = Parse.User.current();

    var driverName = request.params.driverName;
    var driverLocation = request.params.driverLocation;
    var driverPhoneNumber = request.params.driverPhoneNumber;

    var query = (new Parse.Query("Order"));
    query.equalTo("objectId", orderId);

    console.log("USER: " + Parse.User.current());

    query.find({
        success: function(result) {
            var order = result[0];
            if(order.get("orderStatus") == 0) {
                order.set("orderStatus", 1);
                order.set("driver", {"__type":"Pointer", "className":"_User", "objectId":Parse.User.current().id});

                order.set("driverName", driver.get("name"));
                order.set("driverLocation", request.params.driverLocation);
                order.set("driverPhoneNumber", driver.get("phoneNumber"));
                order.set("estimatedDeliveryTime", estimatedDeliveryTime);
                order.save();
                response.success("CLAIMED");

                var orderer = new Parse.User();
                orderer.id = order.get("orderedBy").id;

                var pushQuery = new Parse.Query(Parse.Installation);
                pushQuery.equalTo('channels', order.get("orderedBy").id);

                Parse.Push.send({
                    where: pushQuery,
                    data: {
                        alert: "Your order was claimed by " + driver.get("name")
                    }
                }, {
                    success: function() { 
                    
                    },
                    error: function() {
                        console.log("Error sending push");
                    }
                });
            }
            else {
                response.success("ALREADY CLAIMED");
            }
        }, error: function(error) {
            response.error(error);
        }
    });
});


Parse.Cloud.define("userHasDriverRole", function(request, response) {

    var query = (new Parse.Query(Parse.Role));
    query.equalTo("name", "Drivers");
    query.equalTo("users", Parse.User.current());
    query.first().then(function(hasDriverRole) {
        if(hasDriverRole) {
            response.success("YES");
        }
        else {
            response.success("NO");
        }
    });
});

Parse.Cloud.define("getUsersLiveOrders", function(request, response) {

    var ordersQuery = new Parse.Query("Order");
    ordersQuery.equalTo("orderedBy", request.user);

    ordersQuery.find({
        success: function(results) {
            response.success(results);
        }, error: function(error) {
            response.error(error);
        }
    });
});

Parse.Cloud.define("placeOrder", function(request, response) {

    var NewOrderClass = Parse.Object.extend("Order");
    var newOrder = new NewOrderClass();

    var restaurantQuery = new Parse.Query("Restaurant");
    restaurantQuery.equalTo("restaurantName", request.params.restaurantName);

    restaurantQuery.first({
        success: function(restaurant) {

            var restaurantLocation = restaurant.get("restaurantLocation");
            newOrder.save({
                success: function(success) { 
                    newOrder.set("orderedBy", request.user);
                    newOrder.set("restaurantName", request.params.restaurantName);        
                    newOrder.set("restaurantLocation", restaurantLocation);
                    newOrder.set("ordererName", request.params.ordererName);
                    newOrder.set("ordererPhoneNumber", request.params.ordererPhoneNumber);
                    newOrder.set("deliveryAddress", request.params.deliveryAddress);
                    newOrder.set("deliveryAddressString", request.params.deliveryAddressString);
                    newOrder.set("orderStatus", 0);
                    newOrder.set("timeToBeDeliveredAt", request.params.timeToDeliverAt);
                    newOrder.set("chosenItems", request.params.chosenItems);
                    newOrder.set("orderCost", request.params.orderCost);
                    newOrder.set("additionalDetails", request.params.additionalDetails);
                    newOrder.relation("restaurantFrom").add(restaurant);

                    newOrder.save();
                    response.success("Success!");
                    
                    Parse.Push.send({
                        channels: ["Drivers"],
                        data: {
                            alert: "New Order For " + request.params.restaurantName
                        }
                    }, {
                            success: function() {
                            },
                            error: function() {
                                console.log(error);
                            }
                        }
                    );
                    
                }, error: function(error) {
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

                var restaurantObj = results[i].get("restaurantName"); 

                openRestaurants.push(restaurantObj);
            }

            response.success(openRestaurants);
        },
        error: function() {
            response.error("Error getting open restaurants");
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
                    "itemCost": results[i].get("itemCost"),
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

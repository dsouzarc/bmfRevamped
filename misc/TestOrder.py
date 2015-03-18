import json, httplib, sys, datetime
import config;

#Test making orders

#Returns the current time + 1 hour in ISO format
def getTimeISO():
    rightNow = datetime.datetime.now();
    oneHourLater = rightNow + datetime.timedelta(hours=1);
    return oneHourLater.isoformat();

def jsonRestaurantItem(itemName="name!", itemCost="0.01", description="description!"):
    return json.dumps({
        "itemName": itemName,
        "itemCost": itemCost,
        "itemDescription": description
    });

connection = httplib.HTTPSConnection('api.parse.com', 443);
connection.connect();

userObjectId = config.myobjectid;
restaurantId = "y6x2P5JLZW";

print userObjectId;
chosenItems = [jsonRestaurantItem("Item1", "0.11", "Description 1"), jsonRestaurantItem("Item2", "0.22", "Description 2")];

orderedItems = json.dumps(chosenItems);

deliveryLocation = json.dumps({
    "__type": "GeoPoint",
    "latitude": 39.9,
    "longitude": -39.9
});

deliverTime = json.dumps({ 
    "__type": "Date",
    "iso": getTimeISO()
});

connection.request('POST', '/1/functions/placeOrder', json.dumps({
    "userobjectid": userObjectId,
    "restaurantObjectId": restaurantId,
    "orderitems": orderedItems,
    "deliveryaddress": deliveryLocation,
    "timetodeliverat": deliverTime}), 
    {
        "X-Parse-Application-Id": config.applicationId,
        "X-Parse-REST-API-Key": config.restAPIKey,
        "Content-Type": "application/json"
    });

result = json.loads(connection.getresponse().read());

print result;

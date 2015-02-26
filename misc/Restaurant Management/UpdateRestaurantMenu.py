import json, httplib;
import config, sys;

connection = httplib.HTTPSConnection('api.parse.com', 443);
connection.connect();

restaurantName = raw_input("Restaurant name: ");
file = open(raw_input("Text File: "));

jsonData = json.load(file);

connection.request('POST', '/1/functions/addRestaurant', json.dumps({
    "restaurantName": restaurantName, "restaurantMenu": jsonData}),
    {
        "X-Parse-Application-Id": config.applicationId,
        "X-Parse-REST-API-Key": config.restAPIKey,
        "Content-Type": "application/json"
        });

result = json.loads(connection.getresponse().read());

print result;



'''
connection.request('POST', '/1/functions/addRestaurantItem', json.dumps({
    "itemName": "Testing", "itemCost": "$9.99", "itemDescription": "Description testing"}), 
    {
        "X-Parse-Application-Id": config.applicationId,
        "X-Parse-REST-API-Key": config.restAPIKey,
        "Content-Type": "application/json"
        });

result = json.loads(connection.getresponse().read());

print result;
'''

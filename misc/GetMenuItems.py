import json, httplib, sys;
import config;

#Prints out all menu items associated with the restaurant name (input as parameter)

connection = httplib.HTTPSConnection('api.parse.com', 443);
connection.connect();

connection.request('POST', '/1/functions/getMenuItems', json.dumps({
    "restaurantName":"Tortugas"}), {
        "X-Parse-Application-Id":config.applicationId,
        "X-Parse-REST-API-Key":config.restAPIKey,
        "Content-Type": "application/json"
        });

result = json.loads(connection.getresponse().read())
print result

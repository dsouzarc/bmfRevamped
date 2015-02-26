import json, httplib;
import config, sys;

connection = httplib.HTTPSConnection('api.parse.com', 443);
connection.connect();

file = open(sys.argv[1]);

jsonData = json.load(file);

#print(jsonData);
print json.dumps(jsonData, indent=4, sort_keys=True);



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

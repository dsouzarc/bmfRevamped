import json, httplib;
import config;

newDriverID = raw_input("Enter User's Object ID to add them as a Driver: ");

connection = httplib.HTTPSConnection('api.parse.com', 443);
connection.connect();

connection.request('PUT', '/1/roles/7tjqxB4nOv', json.dumps({
       "users": {
         "__op": "AddRelation",
         "objects": [
           {
             "__type": "Pointer",
             "className": "_User",
             "objectId": newDriverID
           },
         ]
       }
     }), {
       "X-Parse-Application-Id": config.applicationId,
       "X-Parse-Master-Key": config.masterKey,
       "Content-Type": "application/json"
     });

result = json.loads(connection.getresponse().read());

print result;

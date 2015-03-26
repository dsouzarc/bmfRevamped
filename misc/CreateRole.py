import json, httplib;
import config;

connection = httplib.HTTPSConnection('api.parse.com', 443);
connection.connect();

connection.request('POST', '/1/roles', json.dumps({
       "name": "Drivers",
       "ACL": {
         "*": {
           "read": True
         }
       }
     }), {
       "X-Parse-Application-Id": config.applicationId,
       "X-Parse-REST-API-Key": config.restAPIKey,
       "Content-Type": "application/json"
     });

result = json.loads(connection.getresponse().read());

print result;

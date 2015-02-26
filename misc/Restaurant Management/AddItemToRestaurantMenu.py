import json, sys;

#For adding an item to an existing menu stored as a JSON
#File must be inputted as a command-line argument

#Data for the newest menu item
itemName = raw_input("Item name: ");
itemDescription = raw_input("Item description: ");
itemCost = raw_input("Item cost: ");

#Open the restaurant's menu file
with open(sys.argv[1], "r") as file:

    #If it has menu items saved as a JSON
    try:
        #Read it and add the newest menu item to it
        data = json.load(file);
        data["menu"].append({"name":itemName,"description":itemDescription,"cost":itemCost});

    #If there are no JSON items, create a new object and add it
    except ValueError:
        data = {'menu':[{"name":itemName,"description":itemDescription,"cost":itemCost}]};

#Write results
with open(sys.argv[1], 'w') as outfile:
    json.dump(data, outfile);

#Print
print json.dumps(data, indent=4, sort_keys=True);

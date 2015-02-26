import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.util.Scanner;
import java.text.DecimalFormat;

import org.json.JSONArray;
import org.json.JSONObject;

public class RestaurantItemtoJSON { 
  
  private static final Scanner theScanner = new Scanner(System.in);
  private static final DecimalFormat df = new DecimalFormat("#0.00");
  
  /** Creates a new textfile with the restaurant's name
    * Adds each of the restaurant's items as a JSONObject in a JSONArray to a JSONObject
    * Writes the JSONObject to the textfile as a String  */
  public static void addNewRestaurantText() { 
    
    System.out.println("Enter restaurant name: ");
    final String restaurantName = theScanner.nextLine();
    
    try { 
      
      //Overall JSONObject to represent a restaurant
      final JSONObject restaurant = new JSONObject();
      
      //To hold each of the restaurant's items
      final JSONArray menu = new JSONArray();
      
      //To continue adding items to the menu
      boolean toContinue = true;
      
      while(toContinue) { 
        
        //Raw menu item, format ex. "Egg and Cheese$3.25Served on a roll."
        System.out.println("Enter line(s) of items");
        final String line = theScanner.nextLine().replace("+", "");
        
        //End loop
        if(line.equals("end")) { 
          toContinue = false;
          break;
        }
        
        //If there are multiple items separated by a line
        final String[] lineItems = line.split("\n");
        
        for(String lineItem : lineItems) { 
          
          try { 
            
            //Item and description
            final String itemAndDescription = lineItem.replaceAll("[.^0-9]+", "");
            
            final String item = capitalizeString(itemAndDescription.substring(0, itemAndDescription.indexOf("$")));
            
            String description;
            try { 
              description = capitalize(itemAndDescription.substring(itemAndDescription.indexOf("$") + 1));
            }
            catch(Exception e) { 
              description = "";
            }
            
            //Cost of item
            //Find all digits and decimal point after first four chars, replace extra spaces, replace all periods with a space, 
            //remove all spaces before and after number, replace last space with decimal point
            final String subCost = lineItem.substring(4).
              replaceAll("[^.0-9]+", "").replace(" ", "").replace(".", " ").trim().replace(" ", ".");
            //System.out.println("SUBCOST: " + subCost);
            final String cost = df.format(Double.parseDouble(subCost.substring(0, subCost.length())));
            
            //Create a JSONObject for each item with the following fields
            final JSONObject restaurantItem = new JSONObject();
            restaurantItem.put("name", item);
            restaurantItem.put("price", cost);
            restaurantItem.put("description", description);
            
            System.out.println("Item: " + item + "\tCost: $" + cost + "\tDescription: " + description);
            
            //Add each restaurant item to the Menu
            menu.put(restaurantItem);
          }
          catch(Exception e) { 
            System.out.println(e.toString());
          }
        }
      }
      
      //Add the menu (array) to the restaurant JSONObject
      restaurant.put("menu", menu);
      
      //Creates the textfile with the restaurant's name
      final File theFile = new File(restaurantName + ".txt");
      
      //Writes the JSONObject as a string to the file
      BufferedWriter output = new BufferedWriter(new FileWriter(theFile));
      output.write(restaurant.toString());
      output.close();
    }
    catch(Exception e) { 
      e.printStackTrace();
    }
  }
  
  public static String capitalize(String line) {
    return Character.toUpperCase(line.charAt(0)) + line.substring(1);
  }
  
  public static String capitalizeString(String string) {
    char[] chars = string.toLowerCase().toCharArray();
    boolean found = false;
    for (int i = 0; i < chars.length; i++) {
      if (!found && Character.isLetter(chars[i])) {
        chars[i] = Character.toUpperCase(chars[i]);
        found = true;
      } 
      else if (Character.isWhitespace(chars[i]) || chars[i]=='.' || chars[i]=='\'') { // You can add other chars here
        found = false;
      }
    }
    return String.valueOf(chars);
  }
  
  public static void main(String[] ryan) { 
    //For adding a new restaurant and all of its items to a text file
    addNewRestaurantText();
  }
}
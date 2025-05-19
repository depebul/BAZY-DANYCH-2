/* global use, db */
// MongoDB Playground
// To disable this template go to Settings | MongoDB | Use Default Template For Playground.
// Make sure you are connected to enable completions and to be able to run a playground.
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.
// The result of the last command run in a playground is shown on the results panel.
// By default the first 20 documents will be returned with a cursor.
// Use 'console.log()' to print to the debug output.
// For more documentation on playgrounds please refer to
// https://www.mongodb.com/docs/mongodb-vscode/playgrounds/

// Select the database to use.


/* global use, db */
// MongoDB Playground
// Select the database to use.
use('north0');


const maxOrderId = db.orders.find({ CustomerID: "ALFKI" }, { OrderID: 1 })
  .sort({ OrderID: -1 })
  .limit(1)
  .toArray()[0].OrderID;


const session = db.getMongo().startSession();
session.startTransaction();

try {

  const orderDetailsCollection = session.getDatabase("north0").orderdetails;
  orderDetailsCollection.updateMany(
    { OrderID: maxOrderId },
    { $inc: { Discount: 0.05 } }
  );
  

  

  const ordersInfoCollection = session.getDatabase("north0").ordersInfo;
  const orderInfo = ordersInfoCollection.findOne({ OrderID: maxOrderId });
  

  let updatedOrderdetails = orderInfo.Orderdetails.map(detail => {
    const newDiscount = detail.Discount + 0.05;

    const newValue = detail.UnitPrice * detail.Quantity * (1 - newDiscount);
    
    return {
      ...detail,
      Discount: newDiscount,
      Value: newValue
    };
  });
  

  const newOrderTotal = updatedOrderdetails.reduce((sum, detail) => sum + detail.Value, 0);
  

  ordersInfoCollection.updateOne(
    { OrderID: maxOrderId },
    { 
      $set: { 
        Orderdetails: updatedOrderdetails,
        OrderTotal: newOrderTotal
      }
    }
  );
  

  const customerInfoCollection = session.getDatabase("north0").customerInfo;
  customerInfoCollection.updateOne(
    { 
      CustomerID: "ALFKI", 
      "Orders.OrderID": maxOrderId 
    },
    { 
      $set: { 
        "Orders.$.Orderdetails": updatedOrderdetails,
        "Orders.$.OrderTotal": newOrderTotal
      }
    }
  );
  

  session.commitTransaction();
  print("Transakcja zakończona sukcesem. Zniżki zostały zwiększone o 5% we wszystkich kolekcjach.");
  
} catch (error) {

  session.abortTransaction();
  print("Wystąpił błąd podczas aktualizacji zniżek: " + error.message);
  
} finally {

  session.endSession();
}


print("\nUpdated data for OrderID: " + maxOrderId);

print("\n1. OrderDetails:");
db.orderdetails.find({ OrderID: maxOrderId }).forEach(printjson);

print("\n2. OrdersInfo:");
const orderInfo = db.ordersInfo.findOne({ OrderID: maxOrderId });
if (orderInfo) {
    print(`OrderID: ${orderInfo.OrderID}, Total: ${orderInfo.OrderTotal}`);
    orderInfo.Orderdetails.forEach(d => 
        print(`  ${d.product.ProductName}: Discount=${d.Discount}, Value=${d.Value}`)
    );
}

print("\n3. CustomerInfo:");
const customer = db.customerInfo.findOne({ 
    CustomerID: "ALFKI", 
    "Orders.OrderID": maxOrderId 
});
if (customer) {
    const order = customer.Orders.find(o => o.OrderID === maxOrderId);
    print(`Order for ${customer.CompanyName}: Total=${order.OrderTotal}`);
    order.Orderdetails.forEach(d => 
        print(`  ${d.product.ProductName}: Discount=${d.Discount}, Value=${d.Value}`)
    );
}

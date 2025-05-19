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
use('north0');

// Zadanie A

db.orders.aggregate([
  {
    $lookup: {
      from: "customers",
      localField: "CustomerID",
      foreignField: "CustomerID",
      as: "customerData"
    }
  },
  {
    $unwind: "$customerData"
  },
  {
    $lookup: {
      from: "employees",
      localField: "EmployeeID",
      foreignField: "EmployeeID",
      as: "employeeData"
    }
  },
  {
    $unwind: "$employeeData"
  },
  {
    $lookup: {
      from: "shippers",
      localField: "ShipVia",
      foreignField: "ShipperID",
      as: "shipperData"
    }
  },
  {
    $unwind: "$shipperData"
  },
  {
    $lookup: {
      from: "orderdetails",
      let: { orderID: "$OrderID" },
      pipeline: [
        { 
          $match: { 
            $expr: { $eq: ["$OrderID", "$$orderID"] }
          }
        },
        {
          $lookup: {
            from: "products",
            localField: "ProductID",
            foreignField: "ProductID",
            as: "productData"
          }
        },
        {
          $unwind: "$productData"
        },
        {
          $lookup: {
            from: "categories",
            localField: "productData.CategoryID",
            foreignField: "CategoryID",
            as: "categoryData"
          }
        },
        {
          $unwind: "$categoryData"
        },
        {
          $project: {
            _id: 0,
            UnitPrice: 1,
            Quantity: 1,
            Discount: 1,
            Value: { $multiply: [{ $subtract: [1, "$Discount"] }, { $multiply: ["$UnitPrice", "$Quantity"] }] },
            product: {
              ProductID: "$ProductID",
              ProductName: "$productData.ProductName",
              QuantityPerUnit: "$productData.QuantityPerUnit",
              CategoryID: "$productData.CategoryID",
              CategoryName: "$categoryData.CategoryName"
            }
          }
        }
      ],
      as: "Orderdetails"
    }
  },
  {
    $project: {
      _id: 1,
      OrderID: 1,
      Customer: {
        CustomerID: "$customerData.CustomerID",
        CompanyName: "$customerData.CompanyName",
        City: "$customerData.City",
        Country: "$customerData.Country"
      },
      Employee: {
        EmployeeID: "$employeeData.EmployeeID",
        FirstName: "$employeeData.FirstName",
        LastName: "$employeeData.LastName",
        Title: "$employeeData.Title"
      },
      Dates: {
        OrderDate: "$OrderDate",
        RequiredDate: "$RequiredDate"
      },
      Orderdetails: 1,
      Freight: "$Freight",
      OrderTotal: { 
        $reduce: {
          input: "$Orderdetails",
          initialValue: 0,
          in: { $add: ["$$value", "$$this.Value"] }
        }
      },
      Shipment: {
        Shipper: {
          ShipperID: "$shipperData.ShipperID",
          CompanyName: "$shipperData.CompanyName"
        },
        ShipName: "$ShipName",
        ShipAddress: "$ShipAddress",
        ShipCity: "$ShipCity",
        ShipCountry: "$ShipCountry"
      }
    }
  },
  {
    $out: "ordersInfo"
  }
]);

// Zadanie B

db.customers.aggregate([
  {
    $lookup: {
      from: "ordersInfo",
      let: { customerID: "$CustomerID" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$Customer.CustomerID", "$$customerID"] }
          }
        },
        {
          $project: {
            _id: 0,
            OrderID: 1,
            Employee: 1,
            Dates: 1,
            Orderdetails: 1,
            Freight: 1,
            OrderTotal: 1,
            Shipment: 1
          }
        }
      ],
      as: "Orders"
    }
  },
  {
    $project: {
      _id: 1,
      CustomerID: 1,
      CompanyName: 1,
      City: 1,
      Country: 1,
      Orders: 1
    }
  },
  {
    $out: "customerInfo"
  }
]);

// Zadanie C wersja oryginalna

db.customers.aggregate([

  {
    $lookup: {
      from: "orders",
      localField: "CustomerID",
      foreignField: "CustomerID",
      as: "orders"
    }
  },

  { $unwind: { path: "$orders", preserveNullAndEmptyArrays: true } },
  

  {
    $match: {
      "orders.OrderDate": {
        $gte: new Date("1997-01-01"),
        $lt: new Date("1998-01-01")
      }
    }
  },
  

  {
    $lookup: {
      from: "orderdetails",
      localField: "orders.OrderID",
      foreignField: "OrderID",
      as: "details"
    }
  },
  { $unwind: { path: "$details", preserveNullAndEmptyArrays: true } },
  

  {
    $lookup: {
      from: "products",
      localField: "details.ProductID",
      foreignField: "ProductID",
      as: "product"
    }
  },
  { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
  

  {
    $lookup: {
      from: "categories",
      localField: "product.CategoryID",
      foreignField: "CategoryID",
      as: "category"
    }
  },
  { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
  

  {
    $match: {
      "category.CategoryName": "Confections"
    }
  },
  

  {
    $addFields: {
      value: {
        $multiply: [
          "$details.UnitPrice",
          "$details.Quantity",
          { $subtract: [1, "$details.Discount"] }
        ]
      }
    }
  },
  

  {
    $group: {
      _id: "$CustomerID",
      CustomerID: { $first: "$CustomerID" },
      CompanyName: { $first: "$CompanyName" },
      ConfectionsSale97: { $sum: "$value" }
    }
  },
  

  { $sort: { CustomerID: 1 } }
]);

// Zadanie C wersja OrderInfo

db.ordersInfo.aggregate([

  {
    $match: {
      "Dates.OrderDate": {
        $gte: new Date("1997-01-01"),
        $lt: new Date("1998-01-01")
      }
    }
  },
  

  { $unwind: "$Orderdetails" },
  

  {
    $match: {
      "Orderdetails.product.CategoryName": "Confections"
    }
  },
  

  {
    $group: {
      _id: "$Customer.CustomerID",
      CustomerID: { $first: "$Customer.CustomerID" },
      CompanyName: { $first: "$Customer.CompanyName" },
      ConfectionsSale97: { $sum: "$Orderdetails.Value" }
    }
  },
  

  { $sort: { CustomerID: 1 } }
]);

// Zadanie C wersja customerInfo

db.customerInfo.aggregate([

  { $unwind: "$Orders" },
  

  {
    $match: {
      "Orders.Dates.OrderDate": {
        $gte: new Date("1997-01-01"),
        $lt: new Date("1998-01-01")
      }
    }
  },
  

  { $unwind: "$Orders.Orderdetails" },
  

  {
    $match: {
      "Orders.Orderdetails.product.CategoryName": "Confections"
    }
  },
  

  {
    $group: {
      _id: "$CustomerID",
      CustomerID: { $first: "$CustomerID" },
      CompanyName: { $first: "$CompanyName" },
      ConfectionsSale97: { $sum: "$Orders.Orderdetails.Value" }
    }
  },
  

  { $sort: { CustomerID: 1 } }
]);

// Zadanie D Oryginalne

db.customers.aggregate([

  {
    $lookup: {
      from: "orders",
      localField: "CustomerID",
      foreignField: "CustomerID",
      as: "orders"
    }
  },

  { $unwind: { path: "$orders", preserveNullAndEmptyArrays: false } },
  

  {
    $lookup: {
      from: "orderdetails",
      localField: "orders.OrderID",
      foreignField: "OrderID",
      as: "details"
    }
  },

  { $unwind: { path: "$details", preserveNullAndEmptyArrays: false } },
  

  {
    $addFields: {
      year: { $year: "$orders.OrderDate" },
      month: { $month: "$orders.OrderDate" },
      saleValue: {
        $multiply: [
          "$details.UnitPrice", 
          "$details.Quantity", 
          { $subtract: [1, "$details.Discount"] }
        ]
      }
    }
  },
  

  {
    $group: {
      _id: {
        customerID: "$CustomerID",
        year: "$year",
        month: "$month"
      },
      Total: { $sum: "$saleValue" },
      CompanyName: { $first: "$CompanyName" }
    }
  },
  

  {
    $sort: {
      "_id.year": 1,
      "_id.month": 1
    }
  },
  

  {
    $group: {
      _id: "$_id.customerID",
      CustomerID: { $first: "$_id.customerID" },
      CompanyName: { $first: "$CompanyName" },
      Sale: {
        $push: {
          Year: "$_id.year",
          Month: "$_id.month",
          Total: { $round: ["$Total", 2] }
        }
      }
    }
  },
  

  { $sort: { CustomerID: 1 } }
]);

// Zadanie D OrdersInfo

db.ordersInfo.aggregate([

  { $unwind: "$Orderdetails" },
  

  {
    $addFields: {
      year: { $year: "$Dates.OrderDate" },
      month: { $month: "$Dates.OrderDate" }
    }
  },
  

  {
    $group: {
      _id: {
        customerID: "$Customer.CustomerID",
        year: "$year",
        month: "$month"
      },
      Total: { $sum: "$Orderdetails.Value" },
      CompanyName: { $first: "$Customer.CompanyName" }
    }
  },
  

  {
    $sort: {
      "_id.year": 1,
      "_id.month": 1
    }
  },
  

  {
    $group: {
      _id: "$_id.customerID",
      CustomerID: { $first: "$_id.customerID" },
      CompanyName: { $first: "$CompanyName" },
      Sale: {
        $push: {
          Year: "$_id.year",
          Month: "$_id.month",
          Total: { $round: ["$Total", 2] }
        }
      }
    }
  },
  

  { $sort: { CustomerID: 1 } }
]);

// Zadanie D CustomerInfo

db.customerInfo.aggregate([

  { $unwind: "$Orders" },
  

  { $unwind: "$Orders.Orderdetails" },
  

  {
    $addFields: {
      year: { $year: "$Orders.Dates.OrderDate" },
      month: { $month: "$Orders.Dates.OrderDate" }
    }
  },
  

  {
    $group: {
      _id: {
        customerID: "$CustomerID",
        year: "$year",
        month: "$month"
      },
      Total: { $sum: "$Orders.Orderdetails.Value" },
      CompanyName: { $first: "$CompanyName" }
    }
  },
  

  {
    $sort: {
      "_id.year": 1,
      "_id.month": 1
    }
  },
  

  {
    $group: {
      _id: "$_id.customerID",
      CustomerID: { $first: "$_id.customerID" },
      CompanyName: { $first: "$CompanyName" },
      Sale: {
        $push: {
          Year: "$_id.year",
          Month: "$_id.month",
          Total: { $round: ["$Total", 2] }
        }
      }
    }
  },
  

  { $sort: { CustomerID: 1 } }
]);

// Zadanie E


const session = db.getMongo().startSession();
session.startTransaction();

try {

  const ordersCollection = session.getDatabase("north0").orders;
  const orderDetailsCollection = session.getDatabase("north0").orderdetails;
  const ordersInfoCollection = session.getDatabase("north0").ordersInfo;
  const customerInfoCollection = session.getDatabase("north0").customerInfo;
  

  const maxOrderId = ordersCollection.find({}, { OrderID: 1 }).sort({ OrderID: -1 }).limit(1).toArray()[0].OrderID;
  const newOrderId = maxOrderId + 1;
  const customer = session.getDatabase("north0").customers.findOne({ CustomerID: "ALFKI" });
  const employee = session.getDatabase("north0").employees.findOne({ EmployeeID: 5 });
  const chaiProduct = session.getDatabase("north0").products.findOne({ ProductName: "Chai" });
  const ikuraProduct = session.getDatabase("north0").products.findOne({ ProductName: "Ikura" });
  const chaiCategory = session.getDatabase("north0").categories.findOne({ CategoryID: chaiProduct.CategoryID });
  const ikuraCategory = session.getDatabase("north0").categories.findOne({ CategoryID: ikuraProduct.CategoryID });
  const shipper = session.getDatabase("north0").shippers.findOne({ ShipperID: 1 });
  

  const chaiValue = chaiProduct.UnitPrice * 5 * (1 - 0.0);
  const ikuraValue = ikuraProduct.UnitPrice * 2 * (1 - 0.05);
  const orderTotal = chaiValue + ikuraValue;
  

  const orderDoc = {
    OrderID: newOrderId,
    CustomerID: "ALFKI",
    EmployeeID: 5,
    OrderDate: new Date(),
    RequiredDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    ShippedDate: null,
    ShipVia: shipper.ShipperID,
    Freight: 10.50,
    ShipName: customer.CompanyName,
    ShipAddress: customer.Address,
    ShipCity: customer.City,
    ShipRegion: customer.Region,
    ShipPostalCode: customer.PostalCode,
    ShipCountry: customer.Country
  };
  ordersCollection.insertOne(orderDoc);
  

  orderDetailsCollection.insertMany([
    {
      OrderID: newOrderId,
      ProductID: chaiProduct.ProductID,
      UnitPrice: chaiProduct.UnitPrice,
      Quantity: 5,
      Discount: 0.0
    },
    {
      OrderID: newOrderId,
      ProductID: ikuraProduct.ProductID,
      UnitPrice: ikuraProduct.UnitPrice,
      Quantity: 2,
      Discount: 0.05
    }
  ]);
  

  const orderInfoDoc = {
    OrderID: newOrderId,
    Customer: {
      CustomerID: customer.CustomerID,
      CompanyName: customer.CompanyName,
      City: customer.City,
      Country: customer.Country
    },
    Employee: {
      EmployeeID: employee.EmployeeID,
      FirstName: employee.FirstName,
      LastName: employee.LastName,
      Title: employee.Title
    },
    Dates: {
      OrderDate: new Date(),
      RequiredDate: new Date(new Date().setDate(new Date().getDate() + 7))
    },
    Orderdetails: [
      {
        UnitPrice: chaiProduct.UnitPrice,
        Quantity: 5,
        Discount: 0.0,
        Value: chaiValue,
        product: {
          ProductID: chaiProduct.ProductID,
          ProductName: chaiProduct.ProductName,
          QuantityPerUnit: chaiProduct.QuantityPerUnit,
          CategoryID: chaiProduct.CategoryID,
          CategoryName: chaiCategory.CategoryName
        }
      },
      {
        UnitPrice: ikuraProduct.UnitPrice,
        Quantity: 2,
        Discount: 0.05,
        Value: ikuraValue,
        product: {
          ProductID: ikuraProduct.ProductID,
          ProductName: ikuraProduct.ProductName,
          QuantityPerUnit: ikuraProduct.QuantityPerUnit,
          CategoryID: ikuraProduct.CategoryID,
          CategoryName: ikuraCategory.CategoryName
        }
      }
    ],
    Freight: 10.50,
    OrderTotal: orderTotal,
    Shipment: {
      Shipper: {
        ShipperID: shipper.ShipperID,
        CompanyName: shipper.CompanyName
      },
      ShipName: customer.CompanyName,
      ShipAddress: customer.Address,
      ShipCity: customer.City,
      ShipCountry: customer.Country
    }
  };
  ordersInfoCollection.insertOne(orderInfoDoc);
  

  const orderForCustomerInfo = { ...orderInfoDoc };
  delete orderForCustomerInfo.Customer;
  
  customerInfoCollection.updateOne(
    { CustomerID: "ALFKI" },
    { $push: { Orders: orderForCustomerInfo } }
  );
  

  session.commitTransaction();
} catch (error) {

  session.abortTransaction();
  throw error;
} finally {

  session.endSession();
}

// Zadanie F


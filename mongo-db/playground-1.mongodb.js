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

// const orderInfoSchema = {
//   $jsonSchema: {
//     bsonType: "object",
//     required: ["OrderID", "Customer", "Employee", "Dates", "Orderdetails", "Freight", "OrderTotal", "Shipment"],
//     properties: {
//       OrderID: { bsonType: "int" },
//       Customer: {
//         bsonType: "object",
//         required: ["CustomerID", "CompanyName", "City", "Country"],
//         properties: {
//           CustomerID: { bsonType: "string" },
//           CompanyName: { bsonType: "string" },
//           City: { bsonType: "string" },
//           Country: { bsonType: "string" }
//         }
//       },
//       Employee: {
//         bsonType: "object",
//         required: ["EmployeeID", "FirstName", "LastName", "Title"],
//         properties: {
//           EmployeeID: { bsonType: "int" },
//           FirstName: { bsonType: "string" },
//           LastName: { bsonType: "string" },
//           Title: { bsonType: "string" }
//         }
//       },
//       Dates: {
//         bsonType: "object",
//         required: ["OrderDate", "RequiredDate"],
//         properties: {
//           OrderDate: { bsonType: "date" },
//           RequiredDate: { bsonType: "date" }
//         }
//       },
//       Orderdetails: {
//         bsonType: "array",
//         items: {
//           bsonType: "object",
//           required: ["UnitPrice", "Quantity", "Discount", "Value", "product"],
//           properties: {
//             UnitPrice: { bsonType: "double" },
//             Quantity: { bsonType: "int" },
//             Discount: { bsonType: "double" },
//             Value: { bsonType: "double" },
//             product: {
//               bsonType: "object",
//               required: ["ProductID", "ProductName", "QuantityPerUnit", "CategoryID", "CategoryName"],
//               properties: {
//                 ProductID: { bsonType: "int" },
//                 ProductName: { bsonType: "string" },
//                 QuantityPerUnit: { bsonType: "string" },
//                 CategoryID: { bsonType: "int" },
//                 CategoryName: { bsonType: "string" }
//               }
//             }
//           }
//         }
//       },
//       Freight: { bsonType: "double" },
//       OrderTotal: { bsonType: "double" },
//       Shipment: {
//         bsonType: "object",
//         required: ["Shipper", "ShipName", "ShipAddress", "ShipCity", "ShipCountry"],
//         properties: {
//           Shipper: {
//             bsonType: "object",
//             required: ["ShipperID", "CompanyName"],
//             properties: {
//               ShipperID: { bsonType: "int" },
//               CompanyName: { bsonType: "string" }
//             }
//           },
//           ShipName: { bsonType: "string" },
//           ShipAddress: { bsonType: "string" },
//           ShipCity: { bsonType: "string" },
//           ShipCountry: { bsonType: "string" }
//         }
//       }
//     }
//   }
// };

// db.createCollection("ordersInfo", { validator: orderInfoSchema });


// db.orders.aggregate([
//   {
//     $lookup: {
//       from: "customers",
//       localField: "CustomerID",
//       foreignField: "CustomerID",
//       as: "customerData"
//     }
//   },
//   {
//     $unwind: "$customerData"
//   },
//   {
//     $lookup: {
//       from: "employees",
//       localField: "EmployeeID",
//       foreignField: "EmployeeID",
//       as: "employeeData"
//     }
//   },
//   {
//     $unwind: "$employeeData"
//   },
//   {
//     $lookup: {
//       from: "shippers",
//       localField: "ShipVia",
//       foreignField: "ShipperID",
//       as: "shipperData"
//     }
//   },
//   {
//     $unwind: "$shipperData"
//   },
//   {
//     $lookup: {
//       from: "orderdetails",
//       let: { orderID: "$OrderID" },
//       pipeline: [
//         { 
//           $match: { 
//             $expr: { $eq: ["$OrderID", "$$orderID"] }
//           }
//         },
//         {
//           $lookup: {
//             from: "products",
//             localField: "ProductID",
//             foreignField: "ProductID",
//             as: "productData"
//           }
//         },
//         {
//           $unwind: "$productData"
//         },
//         {
//           $lookup: {
//             from: "categories",
//             localField: "productData.CategoryID",
//             foreignField: "CategoryID",
//             as: "categoryData"
//           }
//         },
//         {
//           $unwind: "$categoryData"
//         },
//         {
//           $project: {
//             _id: 0,
//             UnitPrice: 1,
//             Quantity: 1,
//             Discount: 1,
//             Value: { $multiply: [{ $subtract: [1, "$Discount"] }, { $multiply: ["$UnitPrice", "$Quantity"] }] },
//             product: {
//               ProductID: "$ProductID",
//               ProductName: "$productData.ProductName",
//               QuantityPerUnit: "$productData.QuantityPerUnit",
//               CategoryID: "$productData.CategoryID",
//               CategoryName: "$categoryData.CategoryName"
//             }
//           }
//         }
//       ],
//       as: "Orderdetails"
//     }
//   },
//   {
//     $project: {
//       _id: 1,
//       OrderID: 1,
//       Customer: {
//         CustomerID: "$customerData.CustomerID",
//         CompanyName: "$customerData.CompanyName",
//         City: "$customerData.City",
//         Country: "$customerData.Country"
//       },
//       Employee: {
//         EmployeeID: "$employeeData.EmployeeID",
//         FirstName: "$employeeData.FirstName",
//         LastName: "$employeeData.LastName",
//         Title: "$employeeData.Title"
//       },
//       Dates: {
//         OrderDate: "$OrderDate",
//         RequiredDate: "$RequiredDate"
//       },
//       Orderdetails: 1,
//       Freight: "$Freight",
//       OrderTotal: { 
//         $reduce: {
//           input: "$Orderdetails",
//           initialValue: 0,
//           in: { $add: ["$$value", "$$this.Value"] }
//         }
//       },
//       Shipment: {
//         Shipper: {
//           ShipperID: "$shipperData.ShipperID",
//           CompanyName: "$shipperData.CompanyName"
//         },
//         ShipName: "$ShipName",
//         ShipAddress: "$ShipAddress",
//         ShipCity: "$ShipCity",
//         ShipCountry: "$ShipCountry"
//       }
//     }
//   },
//   {
//     $out: "ordersInfo"
//   }
// ]);


const customerInfoSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["CustomerID", "CompanyName", "City", "Country", "Orders"],
    properties: {
      CustomerID: { bsonType: "string" },
      CompanyName: { bsonType: "string" },
      City: { bsonType: "string" },
      Country: { bsonType: "string" },
      Orders: {
        bsonType: "array",
        items: {
          bsonType: "object",
          required: ["OrderID", "Employee", "Dates", "Orderdetails", "Freight", "OrderTotal", "Shipment"],
          properties: {
            OrderID: { bsonType: "int" },
            Employee: {
              bsonType: "object",
              required: ["EmployeeID", "FirstName", "LastName", "Title"],
              properties: {
                EmployeeID: { bsonType: "int" },
                FirstName: { bsonType: "string" },
                LastName: { bsonType: "string" },
                Title: { bsonType: "string" }
              }
            },
            Dates: {
              bsonType: "object",
              required: ["OrderDate", "RequiredDate"],
              properties: {
                OrderDate: { bsonType: "date" },
                RequiredDate: { bsonType: "date" }
              }
            },
            Orderdetails: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["UnitPrice", "Quantity", "Discount", "Value", "product"],
                properties: {
                  UnitPrice: { bsonType: "double" },
                  Quantity: { bsonType: "int" },
                  Discount: { bsonType: "double" },
                  Value: { bsonType: "double" },
                  product: {
                    bsonType: "object",
                    required: ["ProductID", "ProductName", "QuantityPerUnit", "CategoryID", "CategoryName"],
                    properties: {
                      ProductID: { bsonType: "int" },
                      ProductName: { bsonType: "string" },
                      QuantityPerUnit: { bsonType: "string" },
                      CategoryID: { bsonType: "int" },
                      CategoryName: { bsonType: "string" }
                    }
                  }
                }
              }
            },
            Freight: { bsonType: "double" },
            OrderTotal: { bsonType: "double" },
            Shipment: {
              bsonType: "object",
              required: ["Shipper", "ShipName", "ShipAddress", "ShipCity", "ShipCountry"],
              properties: {
                Shipper: {
                  bsonType: "object",
                  required: ["ShipperID", "CompanyName"],
                  properties: {
                    ShipperID: { bsonType: "int" },
                    CompanyName: { bsonType: "string" }
                  }
                },
                ShipName: { bsonType: "string" },
                ShipAddress: { bsonType: "string" },
                ShipCity: { bsonType: "string" },
                ShipCountry: { bsonType: "string" }
              }
            }
          }
        }
      }
    }
  }
};

db.createCollection("customerInfo", { validator: customerInfoSchema });

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
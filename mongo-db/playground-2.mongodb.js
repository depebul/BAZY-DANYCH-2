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

// db.ordersInfo.aggregate([

//     {
//       $match: {
//         "Dates.OrderDate": {
//           $gte: new Date("1997-01-01"),
//           $lt: new Date("1998-01-01")
//         }
//       }
//     },
    

//     { $unwind: "$Orderdetails" },
    

//     {
//       $match: {
//         "Orderdetails.product.CategoryName": "Confections"
//       }
//     },
    

//     {
//       $group: {
//         _id: "$Customer.CustomerID",
//         CustomerID: { $first: "$Customer.CustomerID" },
//         CompanyName: { $first: "$Customer.CompanyName" },
//         ConfectionsSale97: { $sum: "$Orderdetails.Value" }
//       }
//     },
    

//     {
//       $project: {
//         _id: 1,
//         CustomerID: 1,
//         CompanyName: 1,
//         ConfectionsSale97: { $round: ["$ConfectionsSale97", 2] }
//       }
//     },
    

//     { $sort: { CustomerID: 1 } }
//   ]);

// db.ordersInfo.aggregate([

//     { $unwind: "$Orderdetails" },
    

//     {
//       $addFields: {
//         year: { $year: "$Dates.OrderDate" },
//         month: { $month: "$Dates.OrderDate" }
//       }
//     },
    

//     {
//       $group: {
//         _id: {
//           customerID: "$Customer.CustomerID",
//           year: "$year",
//           month: "$month"
//         },
//         Total: { $sum: "$Orderdetails.Value" },
//         CompanyName: { $first: "$Customer.CompanyName" }
//       }
//     },
    

//     {
//       $sort: {
//         "_id.year": 1,
//         "_id.month": 1
//       }
//     },
    

//     {
//       $group: {
//         _id: "$_id.customerID",
//         CustomerID: { $first: "$_id.customerID" },
//         CompanyName: { $first: "$CompanyName" },
//         Sale: {
//           $push: {
//             Year: "$_id.year",
//             Month: "$_id.month",
//             Total: { $round: ["$Total", 2] }
//           }
//         }
//       }
//     },
    

//     { $sort: { CustomerID: 1 } }
//   ]);
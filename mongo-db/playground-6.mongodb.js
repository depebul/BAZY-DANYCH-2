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


use('north0');

// Tablica do przechowywania informacji o znalezionych stringowych datach
let stringDatesFound = [];

// Przeszukaj kolekcję customerInfo
db.customerInfo.find({}).forEach(customer => {
  // Dla każdego klienta, sprawdź zamówienia
  if (customer.Orders && customer.Orders.length > 0) {
    customer.Orders.forEach((order, orderIndex) => {
      // Sprawdź strukturę dat w zamówieniu
      if (order.Dates) {
        // Sprawdź typ OrderDate
        if (order.Dates.OrderDate && typeof order.Dates.OrderDate === "string") {
          stringDatesFound.push({
            collectionName: "customerInfo",
            customerID: customer.CustomerID,
            companyName: customer.CompanyName,
            orderID: order.OrderID,
            fieldPath: `Orders[${orderIndex}].Dates.OrderDate`,
            value: order.Dates.OrderDate,
            type: typeof order.Dates.OrderDate
          });
        }
        
        // Sprawdź typ RequiredDate
        if (order.Dates.RequiredDate && typeof order.Dates.RequiredDate === "string") {
          stringDatesFound.push({
            collectionName: "customerInfo",
            customerID: customer.CustomerID,
            companyName: customer.CompanyName,
            orderID: order.OrderID,
            fieldPath: `Orders[${orderIndex}].Dates.RequiredDate`,
            value: order.Dates.RequiredDate,
            type: typeof order.Dates.RequiredDate
          });
        }
        
        // Sprawdź typ ShippedDate, jeśli istnieje
        if (order.Dates.ShippedDate && typeof order.Dates.ShippedDate === "string") {
          stringDatesFound.push({
            collectionName: "customerInfo",
            customerID: customer.CustomerID,
            companyName: customer.CompanyName,
            orderID: order.OrderID,
            fieldPath: `Orders[${orderIndex}].Dates.ShippedDate`,
            value: order.Dates.ShippedDate,
            type: typeof order.Dates.ShippedDate
          });
        }
      }
    });
  }
});

// Sprawdź też kolekcję ordersInfo
db.ordersInfo.find({}).forEach(order => {
  if (order.Dates) {
    // Sprawdź typ OrderDate
    if (order.Dates.OrderDate && typeof order.Dates.OrderDate === "string") {
      stringDatesFound.push({
        collectionName: "ordersInfo",
        orderID: order.OrderID,
        fieldPath: "Dates.OrderDate",
        value: order.Dates.OrderDate,
        type: typeof order.Dates.OrderDate
      });
    }
    
    // Sprawdź typ RequiredDate
    if (order.Dates.RequiredDate && typeof order.Dates.RequiredDate === "string") {
      stringDatesFound.push({
        collectionName: "ordersInfo",
        orderID: order.OrderID,
        fieldPath: "Dates.RequiredDate",
        value: order.Dates.RequiredDate,
        type: typeof order.Dates.RequiredDate
      });
    }
    
    // Sprawdź typ ShippedDate, jeśli istnieje
    if (order.Dates.ShippedDate && typeof order.Dates.ShippedDate === "string") {
      stringDatesFound.push({
        collectionName: "ordersInfo",
        orderID: order.OrderID,
        fieldPath: "Dates.ShippedDate",
        value: order.Dates.ShippedDate,
        type: typeof order.Dates.ShippedDate
      });
    }
  }
});

// Podsumowanie wyników
if (stringDatesFound.length > 0) {
  print(`Znaleziono ${stringDatesFound.length} dat zapisanych jako stringi:`);
  stringDatesFound.forEach((item, index) => {
    print(`\n${index + 1}. Kolekcja: ${item.collectionName}`);
    if (item.customerID) {
      print(`   Klient: ${item.customerID} (${item.companyName})`);
    }
    print(`   Zamówienie ID: ${item.orderID}`);
    print(`   Ścieżka pola: ${item.fieldPath}`);
    print(`   Wartość: ${item.value}`);
    print(`   Typ: ${item.type}`);
  });
  
  // Opcjonalnie - wyświetl podsumowanie po kolekcjach
  const countByCollection = stringDatesFound.reduce((acc, item) => {
    acc[item.collectionName] = (acc[item.collectionName] || 0) + 1;
    return acc;
  }, {});
  
  print("\nPodsumowanie znalezionych stringowych dat według kolekcji:");
  for (const [collection, count] of Object.entries(countByCollection)) {
    print(`${collection}: ${count}`);
  }
} else {
  print("Nie znaleziono żadnych dat zapisanych jako stringi.");
}

// Zwróć tablicę wyników
stringDatesFound;
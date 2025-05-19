// Krok 1: Znajdź najwyższy numer OrderID, aby wygenerować nowy unikalny ID
const maxOrderId = db.orders.find({}, { OrderID: 1 }).sort({ OrderID: -1 }).limit(1).toArray()[0].OrderID;
const newOrderId = maxOrderId + 1;

// Krok 2: Pobierz niezbędne dane o kliencie, produktach i przewoźniku
const customer = db.customers.findOne({ CustomerID: "ALFKI" });
const chaiProduct = db.products.findOne({ ProductName: "Chai" });
const ikuraProduct = db.products.findOne({ ProductName: "Ikura" });
const shipper = db.shippers.findOne({ ShipperID: 1 }); // Wybieramy przewoźnika o ID 1

// Krok 3: Utwórz i dodaj nowe zamówienie
db.orders.insertOne({
  OrderID: newOrderId,
  CustomerID: "ALFKI",
  EmployeeID: 5, // Przykładowy pracownik
  OrderDate: new Date(),
  RequiredDate: new Date(new Date().setDate(new Date().getDate() + 7)), // Dostawa za 7 dni
  ShippedDate: null, // Jeszcze nie wysłane
  ShipVia: shipper.ShipperID,
  Freight: 10.50, // Przykładowa opłata za przesyłkę
  ShipName: customer.CompanyName,
  ShipAddress: customer.Address,
  ShipCity: customer.City,
  ShipRegion: customer.Region,
  ShipPostalCode: customer.PostalCode,
  ShipCountry: customer.Country
});

// Krok 4: Dodaj szczegóły zamówienia dla produktu Chai
db.orderdetails.insertOne({
  OrderID: newOrderId,
  ProductID: chaiProduct.ProductID,
  UnitPrice: chaiProduct.UnitPrice,
  Quantity: 5,
  Discount: 0.0
});

// Krok 5: Dodaj szczegóły zamówienia dla produktu Ikura
db.orderdetails.insertOne({
  OrderID: newOrderId,
  ProductID: ikuraProduct.ProductID,
  UnitPrice: ikuraProduct.UnitPrice,
  Quantity: 2,
  Discount: 0.05
});
# Dokumentowe bazy danych – MongoDB

Ćwiczenie/zadanie

<style>
  {
    font-size: 16pt;
  }
</style> 

<style scoped>
 li, p {
    font-size: 10pt;
  }
</style> 

<style scoped>
 pre {
    font-size: 8pt;
  }
</style> 
---

**Imiona i nazwiska autorów:**
- Szymon Migas
- Dawid Żak

--- 

Odtwórz z backupu bazę north0

```
mongorestore --nsInclude='north0.*' ./dump/
```

```
use north0
```
Ponieważ pracowaliśmy na klastrze zdalnym, poniżej komenda, której użyliśmy:
```bash
./bin/mongorestore --uri "mongodb+srv://smigas:<####>@cluster-1.0pcsnxc.mongodb.net/north0" --nsInclude='north0.*' ./north0
```


# Zadanie 1 - operacje wyszukiwania danych,  przetwarzanie dokumentów

# a)

stwórz kolekcję  `OrdersInfo`  zawierającą następujące dane o zamówieniach
- pojedynczy dokument opisuje jedno zamówienie

```js
[  
  {  
    "_id": ...
    
    OrderID": ... numer zamówienia
    
    "Customer": {  ... podstawowe informacje o kliencie skladającym  
      "CustomerID": ... identyfikator klienta
      "CompanyName": ... nazwa klienta
      "City": ... miasto 
      "Country": ... kraj 
    },  
    
    "Employee": {  ... podstawowe informacje o pracowniku obsługującym zamówienie
      "EmployeeID": ... idntyfikator pracownika 
      "FirstName": ... imie   
      "LastName": ... nazwisko
      "Title": ... stanowisko  
     
    },  
    
    "Dates": {
       "OrderDate": ... data złożenia zamówienia
       "RequiredDate": data wymaganej realizacji
    }

    "Orderdetails": [  ... pozycje/szczegóły zamówienia - tablica takich pozycji 
      {  
        "UnitPrice": ... cena
        "Quantity": ... liczba sprzedanych jednostek towaru
        "Discount": ... zniżka  
        "Value": ... wartośc pozycji zamówienia
        "product": { ... podstawowe informacje o produkcie 
          "ProductID": ... identyfikator produktu  
          "ProductName": ... nazwa produktu 
          "QuantityPerUnit": ... opis/opakowannie
          "CategoryID": ... identyfikator kategorii do której należy produkt
          "CategoryName" ... nazwę tej kategorii
        },  
      },  
      ...   
    ],  

    "Freight": ... opłata za przesyłkę
    "OrderTotal"  ... sumaryczna wartosc sprzedanych produktów

    "Shipment" : {  ... informacja o wysyłce
        "Shipper": { ... podstawowe inf o przewoźniku 
           "ShipperID":  
            "CompanyName":
        }  
        ... inf o odbiorcy przesyłki
        "ShipName": ...
        "ShipAddress": ...
        "ShipCity": ... 
        "ShipCountry": ...
    } 
  } 
]  
```


# b)

stwórz kolekcję  `CustomerInfo`  zawierającą następujące dane kazdym klencie
- pojedynczy dokument opisuje jednego klienta

```js
[  
  {  
    "_id": ...
    
    "CustomerID": ... identyfikator klienta
    "CompanyName": ... nazwa klienta
    "City": ... miasto 
    "Country": ... kraj 

	"Orders": [ ... tablica zamówień klienta o strukturze takiej jak w punkcie a) (oczywiście bez informacji o kliencie)
	  
	]

		  
]  
```

# c) 

Napisz polecenie/zapytanie: Dla każdego klienta pokaż wartość zakupionych przez niego produktów z kategorii 'Confections'  w 1997r
- Spróbuj napisać to zapytanie wykorzystując
	- oryginalne kolekcje (`customers, orders, orderdertails, products, categories`)
	- kolekcję `OrderInfo`
	- kolekcję `CustomerInfo`

- porównaj zapytania/polecenia/wyniki

```js
[  
  {  
    "_id": 
    
    "CustomerID": ... identyfikator klienta
    "CompanyName": ... nazwa klienta
	"ConfectionsSale97": ... wartość zakupionych przez niego produktów z kategorii 'Confections'  w 1997r

  }		  
]  
```

# d)

Napisz polecenie/zapytanie:  Dla każdego klienta poaje wartość sprzedaży z podziałem na lata i miesiące
Spróbuj napisać to zapytanie wykorzystując
	- oryginalne kolekcje (`customers, orders, orderdertails, products, categories`)
	- kolekcję `OrderInfo`
	- kolekcję `CustomerInfo`

- porównaj zapytania/polecenia/wyniki

```js
[  
  {  
    "_id": 
    
    "CustomerID": ... identyfikator klienta
    "CompanyName": ... nazwa klienta

	"Sale": [ ... tablica zawierająca inf o sprzedazy
	    {
            "Year":  ....
            "Month": ....
            "Total": ...	    
	    }
	    ...
	]
  }		  
]  
```

# e)

Załóżmy że pojawia się nowe zamówienie dla klienta 'ALFKI',  zawierające dwa produkty 'Chai' oraz "Ikura"
- pozostałe pola w zamówieniu (ceny, liczby sztuk prod, inf o przewoźniku itp. możesz uzupełnić wg własnego uznania)
Napisz polecenie które dodaje takie zamówienie do bazy
- aktualizując oryginalne kolekcje `orders`, `orderdetails`
- aktualizując kolekcję `OrderInfo`
- aktualizując kolekcję `CustomerInfo`

Napisz polecenie 
- aktualizując oryginalną kolekcję orderdetails`
- aktualizując kolekcję `OrderInfo`
- aktualizując kolekcję `CustomerInfo`

# f)

Napisz polecenie które modyfikuje zamówienie dodane w pkt e)  zwiększając zniżkę  o 5% (dla każdej pozycji tego zamówienia) 

Napisz polecenie 
- aktualizując oryginalną kolekcję `orderdetails`
- aktualizując kolekcję `OrderInfo`
- aktualizując kolekcję `CustomerInfo`



UWAGA:
W raporcie należy zamieścić kod poleceń oraz uzyskany rezultat, np wynik  polecenia `db.kolekcka.fimd().limit(2)` lub jego fragment


## Zadanie 1  - rozwiązanie

### Podpunkt a)
Za pomocą agregacji `aggregate` oraz operatora `$lookup` połączyliśmy potrzebne kolekcje, aby uzyskać odpowiednią strukturę dla kolekcji `ordersInfo`:
``` js
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
            Value: { 
              $multiply: [
                { $subtract: [1, "$Discount"] },
                 {$multiply: ["$UnitPrice", "$Quantity"] }] },
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
```
Wynik polecenia: `db.ordersInfo.find.limit(1)`:
```json
[
  {
    "_id": {"$oid": "63a060b9bb3b972d6f4e2005"},
    "Customer": {
      "CustomerID": "DUMON",
      "CompanyName": "Du monde entier",
      "City": "Nantes",
      "Country": "France"
    },
    "Dates": {
      "OrderDate": {"$date": "1996-09-20T00:00:00.000Z"},
      "RequiredDate": {"$date": "1996-10-04T00:00:00.000Z"}
    },
    "Employee": {
      "EmployeeID": 1,
      "FirstName": "Nancy",
      "LastName": "Davolio",
      "Title": "Sales Representative"
    },
    "Freight": 24.69,
    "OrderID": 10311,
    "OrderTotal": 268.79999999999995,
    "Orderdetails": [
      {
        "UnitPrice": 28.8,
        "Quantity": 7,
        "Discount": 0,
        "Value": 201.6,
        "product": {
          "ProductID": 69,
          "ProductName": "Gudbrandsdalsost",
          "QuantityPerUnit": "10 kg pkg.",
          "CategoryID": 4,
          "CategoryName": "Dairy Products"
        }
      },
      {
        "UnitPrice": 11.2,
        "Quantity": 6,
        "Discount": 0,
        "Value": 67.19999999999999,
        "product": {
          "ProductID": 42,
          "ProductName": "Singaporean Hokkien Fried Mee",
          "QuantityPerUnit": "32 - 1 kg pkgs.",
          "CategoryID": 5,
          "CategoryName": "Grains/Cereals"
        }
      }
    ],
    "Shipment": {
      "Shipper": {
        "ShipperID": 3,
        "CompanyName": "Federal Shipping"
      },
      "ShipName": "Du monde entier",
      "ShipAddress": "67, rue des Cinquante Otages",
      "ShipCity": "Nantes",
      "ShipCountry": "France"
    }
  }
]
```

### Podpunkt b)
Następnie tak jak w podpunkcie A, stworzyliśmy odpowiednie zapytanie agregacyjne, aby wypełnić kolekcję `customerInfo` danymi.

```js

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
```

Wynik zapytania `db.customerInfo.find.limit(1)`:
```json
[
  {
    "_id": {"$oid": "63a05cdfbb3b972d6f4e09aa"},
    "City": "Portland",
    "CompanyName": "Lonesome Pine Restaurant",
    "Country": "USA",
    "CustomerID": "LONEP",
    "Orders": [
      {
        "OrderID": 10544,
        "Orderdetails": [
          {
            "UnitPrice": 14,
            "Quantity": 7,
            "Discount": 0,
            "Value": 98,
            "product": {
              "ProductID": 67,
              "ProductName": "Laughing Lumberjack Lager",
              "QuantityPerUnit": "24 - 12 oz bottles",
              "CategoryID": 1,
              "CategoryName": "Beverages"
            }
          },
          {
            "UnitPrice": 45.6,
            "Quantity": 7,
            "Discount": 0,
            "Value": 319.2,
            "product": {
              "ProductID": 28,
              "ProductName": "Rössle Sauerkraut",
              "QuantityPerUnit": "25 - 825 g cans",
              "CategoryID": 7,
              "CategoryName": "Produce"
            }
          }
        ],
        "Employee": {
          "EmployeeID": 4,
          "FirstName": "Margaret",
          "LastName": "Peacock",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1997-05-21T00:00:00.000Z"},
          "RequiredDate": {"$date": "1997-06-18T00:00:00.000Z"}
        },
        "Freight": 24.91,
        "OrderTotal": 417.2,
        "Shipment": {
          "Shipper": {
            "ShipperID": 1,
            "CompanyName": "Speedy Express"
          },
          "ShipName": "Lonesome Pine Restaurant",
          "ShipAddress": "89 Chiaroscuro Rd.",
          "ShipCity": "Portland",
          "ShipCountry": "USA"
        }
      },
      {
        "OrderID": 10665,
        "Orderdetails": [
          {
            "UnitPrice": 53,
            "Quantity": 20,
            "Discount": 0,
            "Value": 1060,
            "product": {
              "ProductID": 51,
              "ProductName": "Manjimup Dried Apples",
              "QuantityPerUnit": "50 - 300 g pkgs.",
              "CategoryID": 7,
              "CategoryName": "Produce"
            }
          },
          {
            "UnitPrice": 55,
            "Quantity": 1,
            "Discount": 0,
            "Value": 55,
            "product": {
              "ProductID": 59,
              "ProductName": "Raclette Courdavault",
              "QuantityPerUnit": "5 kg pkg.",
              "CategoryID": 4,
              "CategoryName": "Dairy Products"
            }
          },
          {
            "UnitPrice": 18,
            "Quantity": 10,
            "Discount": 0,
            "Value": 180,
            "product": {
              "ProductID": 76,
              "ProductName": "Lakkalikööri",
              "QuantityPerUnit": "500 ml",
              "CategoryID": 1,
              "CategoryName": "Beverages"
            }
          }
        ],
        "Employee": {
          "EmployeeID": 1,
          "FirstName": "Nancy",
          "LastName": "Davolio",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1997-09-11T00:00:00.000Z"},
          "RequiredDate": {"$date": "1997-10-09T00:00:00.000Z"}
        },
        "Freight": 26.31,
        "OrderTotal": 1295,
        "Shipment": {
          "Shipper": {
            "ShipperID": 2,
            "CompanyName": "United Package"
          },
          "ShipName": "Lonesome Pine Restaurant",
          "ShipAddress": "89 Chiaroscuro Rd.",
          "ShipCity": "Portland",
          "ShipCountry": "USA"
        }
      },
      {
        "OrderID": 10662,
        "Orderdetails": [
          {
            "UnitPrice": 12.5,
            "Quantity": 10,
            "Discount": 0,
            "Value": 125,
            "product": {
              "ProductID": 68,
              "ProductName": "Scottish Longbreads",
              "QuantityPerUnit": "10 boxes x 8 pieces",
              "CategoryID": 3,
              "CategoryName": "Confections"
            }
          }
        ],
        "Employee": {
          "EmployeeID": 3,
          "FirstName": "Janet",
          "LastName": "Leverling",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1997-09-09T00:00:00.000Z"},
          "RequiredDate": {"$date": "1997-10-07T00:00:00.000Z"}
        },
        "Freight": 1.28,
        "OrderTotal": 125,
        "Shipment": {
          "Shipper": {
            "ShipperID": 2,
            "CompanyName": "United Package"
          },
          "ShipName": "Lonesome Pine Restaurant",
          "ShipAddress": "89 Chiaroscuro Rd.",
          "ShipCity": "Portland",
          "ShipCountry": "USA"
        }
      },
      {
        "OrderID": 10307,
        "Orderdetails": [
          {
            "UnitPrice": 10,
            "Quantity": 3,
            "Discount": 0,
            "Value": 30,
            "product": {
              "ProductID": 68,
              "ProductName": "Scottish Longbreads",
              "QuantityPerUnit": "10 boxes x 8 pieces",
              "CategoryID": 3,
              "CategoryName": "Confections"
            }
          },
          {
            "UnitPrice": 39.4,
            "Quantity": 10,
            "Discount": 0,
            "Value": 394,
            "product": {
              "ProductID": 62,
              "ProductName": "Tarte au sucre",
              "QuantityPerUnit": "48 pies",
              "CategoryID": 3,
              "CategoryName": "Confections"
            }
          }
        ],
        "Employee": {
          "EmployeeID": 2,
          "FirstName": "Andrew",
          "LastName": "Fuller",
          "Title": "Vice President, Sales"
        },
        "Dates": {
          "OrderDate": {"$date": "1996-09-17T00:00:00.000Z"},
          "RequiredDate": {"$date": "1996-10-15T00:00:00.000Z"}
        },
        "Freight": 0.56,
        "OrderTotal": 424,
        "Shipment": {
          "Shipper": {
            "ShipperID": 2,
            "CompanyName": "United Package"
          },
          "ShipName": "Lonesome Pine Restaurant",
          "ShipAddress": "89 Chiaroscuro Rd.",
          "ShipCity": "Portland",
          "ShipCountry": "USA"
        }
      },
      {
        "OrderID": 10317,
        "Orderdetails": [
          {
            "UnitPrice": 14.4,
            "Quantity": 20,
            "Discount": 0,
            "Value": 288,
            "product": {
              "ProductID": 1,
              "ProductName": "Chai",
              "QuantityPerUnit": "10 boxes x 20 bags",
              "CategoryID": 1,
              "CategoryName": "Beverages"
            }
          }
        ],
        "Employee": {
          "EmployeeID": 6,
          "FirstName": "Michael",
          "LastName": "Suyama",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1996-09-30T00:00:00.000Z"},
          "RequiredDate": {"$date": "1996-10-28T00:00:00.000Z"}
        },
        "Freight": 12.69,
        "OrderTotal": 288,
        "Shipment": {
          "Shipper": {
            "ShipperID": 1,
            "CompanyName": "Speedy Express"
          },
          "ShipName": "Lonesome Pine Restaurant",
          "ShipAddress": "89 Chiaroscuro Rd.",
          "ShipCity": "Portland",
          "ShipCountry": "USA"
        }
      },
      {
        "OrderID": 10883,
        "Orderdetails": [
          {
            "UnitPrice": 4.5,
            "Quantity": 8,
            "Discount": 0,
            "Value": 36,
            "product": {
              "ProductID": 24,
              "ProductName": "Guaraná Fantástica",
              "QuantityPerUnit": "12 - 355 ml cans",
              "CategoryID": 1,
              "CategoryName": "Beverages"
            }
          }
        ],
        "Employee": {
          "EmployeeID": 8,
          "FirstName": "Laura",
          "LastName": "Callahan",
          "Title": "Inside Sales Coordinator"
        },
        "Dates": {
          "OrderDate": {"$date": "1998-02-12T00:00:00.000Z"},
          "RequiredDate": {"$date": "1998-03-12T00:00:00.000Z"}
        },
        "Freight": 0.53,
        "OrderTotal": 36,
        "Shipment": {
          "Shipper": {
            "ShipperID": 3,
            "CompanyName": "Federal Shipping"
          },
          "ShipName": "Lonesome Pine Restaurant",
          "ShipAddress": "89 Chiaroscuro Rd.",
          "ShipCity": "Portland",
          "ShipCountry": "USA"
        }
      },
      {
        "OrderID": 11018,
        "Orderdetails": [
          {
            "UnitPrice": 38,
            "Quantity": 20,
            "Discount": 0,
            "Value": 760,
            "product": {
              "ProductID": 12,
              "ProductName": "Queso Manchego La Pastora",
              "QuantityPerUnit": "10 - 500 g pkgs.",
              "CategoryID": 4,
              "CategoryName": "Dairy Products"
            }
          },
          {
            "UnitPrice": 62.5,
            "Quantity": 10,
            "Discount": 0,
            "Value": 625,
            "product": {
              "ProductID": 18,
              "ProductName": "Carnarvon Tigers",
              "QuantityPerUnit": "16 kg pkg.",
              "CategoryID": 8,
              "CategoryName": "Seafood"
            }
          },
          {
            "UnitPrice": 38,
            "Quantity": 5,
            "Discount": 0,
            "Value": 190,
            "product": {
              "ProductID": 56,
              "ProductName": "Gnocchi di nonna Alice",
              "QuantityPerUnit": "24 - 250 g pkgs.",
              "CategoryID": 5,
              "CategoryName": "Grains/Cereals"
            }
          }
        ],
        "Employee": {
          "EmployeeID": 4,
          "FirstName": "Margaret",
          "LastName": "Peacock",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1998-04-13T00:00:00.000Z"},
          "RequiredDate": {"$date": "1998-05-11T00:00:00.000Z"}
        },
        "Freight": 11.65,
        "OrderTotal": 1575,
        "Shipment": {
          "Shipper": {
            "ShipperID": 2,
            "CompanyName": "United Package"
          },
          "ShipName": "Lonesome Pine Restaurant",
          "ShipAddress": "89 Chiaroscuro Rd.",
          "ShipCity": "Portland",
          "ShipCountry": "USA"
        }
      },
      {
        "OrderID": 10867,
        "Orderdetails": [
          {
            "UnitPrice": 32.8,
            "Quantity": 3,
            "Discount": 0,
            "Value": 98.39999999999999,
            "product": {
              "ProductID": 53,
              "ProductName": "Perth Pasties",
              "QuantityPerUnit": "48 pieces",
              "CategoryID": 6,
              "CategoryName": "Meat/Poultry"
            }
          }
        ],
        "Employee": {
          "EmployeeID": 6,
          "FirstName": "Michael",
          "LastName": "Suyama",
          "Title": "Sales Representative"
        },
        "Dates": {
          "OrderDate": {"$date": "1998-02-03T00:00:00.000Z"},
          "RequiredDate": {"$date": "1998-03-17T00:00:00.000Z"}
        },
        "Freight": 1.93,
        "OrderTotal": 98.39999999999999,
        "Shipment": {
          "Shipper": {
            "ShipperID": 1,
            "CompanyName": "Speedy Express"
          },
          "ShipName": "Lonesome Pine Restaurant",
          "ShipAddress": "89 Chiaroscuro Rd.",
          "ShipCity": "Portland",
          "ShipCountry": "USA"
        }
      }
    ]
  }
]
```
Komentarz
---
Kluczowe dla wygody uzupełniania kolekcji dokumentami było użycie operatora `$out`, który zbiera zebrane podczas agregacji dokumenty i zapisuje je do podanej kolekcji.

### Podpunkt c)
Zapytanie agregacyjne używając jedynie oryginalnych kolekcji w bazie:
```js
db.customers.aggregate([
  {
    $lookup: {
      from: "orders",
      localField: "CustomerID",
      foreignField: "CustomerID",
      as: "orders"
    }
  },
  { $unwind: { path: "$orders" } },
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
  { $unwind: { path: "$details"} },
  {
    $lookup: {
      from: "products",
      localField: "details.ProductID",
      foreignField: "ProductID",
      as: "product"
    }
  },
  { $unwind: { path: "$product"} },
  {
    $lookup: {
      from: "categories",
      localField: "product.CategoryID",
      foreignField: "CategoryID",
      as: "category"
    }
  },
  { $unwind: { path: "$category"} },
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
        ],
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
  {
    $addFields: {
      ConfectionsSale97: { $round: ["$ConfectionsSale97", 2] }
    }
  },
  { $sort: { CustomerID: 1 } },

]);
```
Wynik:
```json
[
  {
    "_id": "ANTON",
    "CompanyName": "Antonio Moreno Taquería",
    "ConfectionsSale97": 958.93,
    "CustomerID": "ANTON"
  }
]
```
Zapytanie korzystając z nowo utworzonej przez nas kolekcji `orderInfo`

```js
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

  {
    $addFields: {
      ConfectionsSale97: { $round: ["$ConfectionsSale97", 2] }
    }
  },


  { $sort: { CustomerID: 1 } }
]);
```
Wynik: 

```json
[
  {
    "_id": "ANTON",
    "CompanyName": "Antonio Moreno Taquería",
    "ConfectionsSale97": 958.93,
    "CustomerID": "ANTON"
  }
]
```

Oraz zapytanie tworzone przy użyciu kolekcji `customerInfo`

```js
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

    {
    $addFields: {
      ConfectionsSale97: { $round: ["$ConfectionsSale97", 2] }
    }
  },

  { $sort: { CustomerID: 1 } }
]);
```
Wynik:
```json
[
  {
    "_id": "ANTON",
    "CompanyName": "Antonio Moreno Taquería",
    "ConfectionsSale97": 958.93,
    "CustomerID": "ANTON"
  }
]
```
### Podpunkt d)
Następnie stworzyliśmy trzy zapytania, dzięki którym uzyskamy informację o łącznej kwocie zamówień klientów z podziałem na lata i pieniądze

Zapytanie z użyciem oryginalnych kolekcji:

```js
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
```
Wynik:
```json
[
  {
    "_id": "ALFKI",
    "CompanyName": "Alfreds Futterkiste",
    "CustomerID": "ALFKI",
    "Sale": [
      {
        "Year": 1997,
        "Month": 8,
        "Total": 814.5
      },
      {
        "Year": 1997,
        "Month": 10,
        "Total": 1208
      },
      {
        "Year": 1998,
        "Month": 1,
        "Total": 845.8
      },
      {
        "Year": 1998,
        "Month": 3,
        "Total": 471.2
      },
      {
        "Year": 1998,
        "Month": 4,
        "Total": 933.5
      },
      {
        "Year": 2025,
        "Month": 5,
        "Total": 401.1
      }
    ]
  }
]
```

Zapytanie wykorzystujące tabelę `orderInfo`:
```js
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
```
Wynik:
```json
[
  {
    "_id": "ALFKI",
    "CompanyName": "Alfreds Futterkiste",
    "CustomerID": "ALFKI",
    "Sale": [
      {
        "Year": 1997,
        "Month": 8,
        "Total": 814.5
      },
      {
        "Year": 1997,
        "Month": 10,
        "Total": 1208
      },
      {
        "Year": 1998,
        "Month": 1,
        "Total": 845.8
      },
      {
        "Year": 1998,
        "Month": 3,
        "Total": 471.2
      },
      {
        "Year": 1998,
        "Month": 4,
        "Total": 933.5
      },
      {
        "Year": 2025,
        "Month": 5,
        "Total": 252.2
      }
    ]
  }
]
```

Zapytanie wykorzystujące tabelę `customerInfo`:

```js
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
```
Wynik:
```json
[
  {
    "_id": "ALFKI",
    "CompanyName": "Alfreds Futterkiste",
    "CustomerID": "ALFKI",
    "Sale": [
      {
        "Year": 1997,
        "Month": 8,
        "Total": 814.5
      },
      {
        "Year": 1997,
        "Month": 10,
        "Total": 1208
      },
      {
        "Year": 1998,
        "Month": 1,
        "Total": 845.8
      },
      {
        "Year": 1998,
        "Month": 3,
        "Total": 471.2
      },
      {
        "Year": 1998,
        "Month": 4,
        "Total": 933.5
      },
      {
        "Year": 2025,
        "Month": 5,
        "Total": 401.1
      }
    ]
  }
]
```
### Podpunkt e)
Aby podczas dodawania nowych dokumentów do bazy w razie niepowodzenia nie utracić spójności danych skorzystaliśmy z mechanizmu transakcji: `https://www.mongodb.com/docs/manual/core/transactions-in-applications/`

```js

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

```

### Podpunkt f)

```js
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
```


---

# Zadanie 2 - modelowanie danych


Zaproponuj strukturę bazy danych dla wybranego/przykładowego zagadnienia/problemu

Należy wybrać jedno zagadnienie/problem (A lub B lub C)

Przykład A
- Wykładowcy, przedmioty, studenci, oceny
	- Wykładowcy prowadzą zajęcia z poszczególnych przedmiotów
	- Studenci uczęszczają na zajęcia
	- Wykładowcy wystawiają oceny studentom
	- Studenci oceniają zajęcia

Przykład B
- Firmy, wycieczki, osoby
	- Firmy organizują wycieczki
	- Osoby rezerwują miejsca/wykupują bilety
	- Osoby oceniają wycieczki

Przykład C
- Własny przykład o podobnym stopniu złożoności

a) Zaproponuj  różne warianty struktury bazy danych i dokumentów w poszczególnych kolekcjach oraz przeprowadzić dyskusję każdego wariantu (wskazać wady i zalety każdego z wariantów)
- zdefiniuj schemat/reguły walidacji danych
- wykorzystaj referencje
- dokumenty zagnieżdżone
- tablice

b) Kolekcje należy wypełnić przykładowymi danymi

c) W kontekście zaprezentowania wad/zalet należy zaprezentować kilka przykładów/zapytań/operacji oraz dla których dedykowany jest dany wariant

W sprawozdaniu należy zamieścić przykładowe dokumenty w formacie JSON ( pkt a) i b)), oraz kod zapytań/operacji (pkt c)), wraz z odpowiednim komentarzem opisującym strukturę dokumentów oraz polecenia ilustrujące wykonanie przykładowych operacji na danych

Do sprawozdania należy kompletny zrzut wykonanych/przygotowanych baz danych (taki zrzut można wykonać np. za pomocą poleceń `mongoexport`, `mongdump` …) oraz plik z kodem operacji/zapytań w wersji źródłowej (np. plik .js, np. plik .md ), załącznik powinien mieć format zip


## Zadanie 2  - rozwiązanie

> Wyniki: 
> 
> przykłady, kod, zrzuty ekranów, komentarz ...

```js
--  ...
```

---

Punktacja:

|         |     |
| ------- | --- |
| zadanie | pkt |
| 1       | 1   |
| 2       | 1   |
| razem   | 2   |




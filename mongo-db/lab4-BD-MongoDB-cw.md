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

> Wyniki: 
> 
> przykłady, kod, zrzuty ekranów, komentarz ...

### Podpunkt a)
Na początku zdefiniowaliśmy schemat do walidacji danych, aby upewnić się, że wszystkie dokumenty znajdujące się w kolekcji `OrdersInfo` będą miały odpowiednią strukturę.
```js
 const orderInfoSchema = {
    $jsonSchema: {
      bsonType: "object",
      required: ["OrderID", "Customer", "Employee", "Dates", "Orderdetails", "Freight", "OrderTotal", "Shipment"],
      properties: {
        OrderID: { bsonType: "int"},
        Customer: {
          bsonType: "object",
          required: ["CustomerID", "CompanyName", "City", "Country"],
          properties: {
            CustomerID: { bsonType: "int" },
            CompanyName: { bsonType: "string" },
            City: { bsonType: "string" },
            Country: { bsonType: "string" }
          }
        },
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
```
Za pomocą powyższego schematu stworzyliśmy kolekcję o nazwie `OrdersInfo`:
``` js
db.createCollection("OrdersInfo", {validator: orderInfoSchema})
```
Dla zachowania przejrzystości i porządku w nazwach kolekcji, zmieniliśmy nazwę nowo utworzonej kolekcji na `ordersInfo`:
``` js
db.OrdersInfo.renameCollection("ordersInfo")
```
Następnie za pomocą agregacji `aggregate` oraz operatora `$lookup` połączyliśmy potrzebne kolekcje, aby uzyskać odpowiednią strukturę dla kolekcji `ordersInfo`:
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
```
### Podpunkt b)
Ponieważ do zdefiniowania walidatora w tym schemacie potrzebujemy części walidatora z podpunktu A, stworzyliśmy nową zmienną zawierającą obkrojoną wersję właściwości pola `Orders`( bez sekcji `Customer` ) :
```js
const orderProperties = {
      required: ["OrderID", "Employee", "Dates", "Orderdetails", "Freight", "OrderTotal", "Shipment"],
      properties: {
        OrderID: { bsonType: "int"},
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
```
Następnie wykorzystując powyższą zmienną stworzyliśmy walidator dla kolekcji `CustomerInfo`:
```js
const customerSchema = {
    $jsonSchema: {
        bsonType: "object",
        required: ["CustemID", "CompanyName", "City", "Country", "Orders"],
        properties: {
            CustomerID: {bsonType: "int"},
            CompanyName: {bsonType: "string"},
            City: {bsonType: "string"},
            Country: {bsonType: "string"},
            Orders: {
                bsonType: "array",
                ...orderProperties
            }
        }
    }
}
```
Mając już gotowy walidator, stworzyliśmy kolekcję o nazwie `customerInfo` (zaczynająca się od małej litery):



```js
db.createCollection("customerInfo", {validator: customerSchema})
```
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
Komentarz
---
Zastosowanie walidatorów w kolekcjach pozwala na zapewnienie spójności danych oraz ich struktury. Dzięki temu, w razie próby dodania dokumenty, który nie spełnia wymagań zdefiniowanych w walidatorze, MongoDB odrzuci taki dokument i poinformuje o błędzie.

Kluczowe dla wygody uzupełniania kolekcji dokumentami było użycie operatora `$out`, który zbiera zebrane podczas agregacji dokumenty i zapisuje je do podanej kolekcji.

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




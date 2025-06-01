using System;
using System.Linq;
var prodContext = new ProdContext();


var supplier1 = new Supplier { CompanyName = "Cuowiek", Street = "Jane", City = "Londym", ZipCode = "12345", BankAccountNumber = "123456789" };
var supplier2 = new Supplier { CompanyName = "Produktor", Street = "Kowalska", City = "Warszawa", ZipCode = "54321", BankAccountNumber = "987654321" };

var customer2 = new Customer { CompanyName = "Kowal", Street = "Nowa", City = "Kraków", ZipCode = "67890", Discount = 5.0 };
var customer1 = new Customer { CompanyName = "Nowak", Street = "Stara", City = "Wrocław", ZipCode = "09876", Discount = 10.0 };

prodContext.Suppliers.AddRange(supplier1, supplier2);
prodContext.Customers.AddRange(customer1, customer2);

prodContext.SaveChanges();
// Query suppliers from Londym
var londynSuppliers = prodContext.Suppliers
    .Where(s => s.City == "Londym")
    .ToList();
Console.WriteLine("Suppliers from Londym:");
foreach (var supplier in londynSuppliers)
{
    Console.WriteLine($"- {supplier.CompanyName}, {supplier.Street}");
}

// Query suppliers by company name containing specific text
var suppliersWithCo = prodContext.Suppliers
    .Where(s => s.CompanyName.Contains("o"))
    .ToList();
Console.WriteLine("\nSuppliers with 'o' in name:");
foreach (var supplier in suppliersWithCo)
{
    Console.WriteLine($"- {supplier.CompanyName}");
}

// Query customers by zip code
var customersWithZip = prodContext.Customers
    .Where(c => c.ZipCode.StartsWith("0"))
    .ToList();
Console.WriteLine("\nCustomers with zip starting with '0':");
foreach (var customer in customersWithZip)
{
    Console.WriteLine($"- {customer.CompanyName}, Zip: {customer.ZipCode}");
}

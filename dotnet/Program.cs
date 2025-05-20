using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;

Console.WriteLine("=== Zadanie a: Modyfikacja modelu - Dostawcy ===");


using ProdContext prodContext = new ProdContext();


Console.WriteLine("\ni. Tworzenie nowego dostawcy:");
Supplier supplier = new Supplier
{
    CompanyName = "ABC Trading",
    Street = "Główna 123",
    City = "Warszawa"
};

prodContext.Suppliers.Add(supplier);
prodContext.SaveChanges();
Console.WriteLine($"Utworzono dostawcę: {supplier.CompanyName} (ID: {supplier.SupplierId})");
Console.WriteLine($"Adres: {supplier.Street}, {supplier.City}");


Console.WriteLine("\nii. Istniejące produkty w bazie:");
var products = prodContext.Products.ToList();

if (products.Count == 0)
{

    Console.WriteLine("Brak produktów w bazie. Tworzenie przykładowego produktu...");
    Product newProduct = new Product
    {
        ProductName = "Przykładowy Produkt",
        UnitsInStock = 10
    };
    prodContext.Products.Add(newProduct);
    prodContext.SaveChanges();
    products = prodContext.Products.ToList();
}

foreach (var p in products)
{
    Console.WriteLine($"ID: {p.ProductId}, Nazwa: {p.ProductName}, Ilość: {p.UnitsInStock}");
}

Console.WriteLine("\nPodaj ID produktu, którego dostawcę chcesz ustawić: ");
if (int.TryParse(Console.ReadLine(), out int productId))
{
    var product = prodContext.Products.Find(productId);

    if (product != null)
    {

        product.SupplierId = supplier.SupplierId;
        prodContext.SaveChanges();

        Console.WriteLine($"Przypisano dostawcę '{supplier.CompanyName}' do produktu '{product.ProductName}'");
    }
    else
    {
        Console.WriteLine("Nie znaleziono produktu o podanym ID.");
    }
}
else
{
    Console.WriteLine("Nieprawidłowe ID produktu.");
}


Console.WriteLine("\niii. Rezultaty operacji:");
Console.WriteLine("\nTabela Suppliers:");
var suppliers = prodContext.Suppliers.ToList();
foreach (var s in suppliers)
{
    Console.WriteLine($"ID: {s.SupplierId}, Nazwa: {s.CompanyName}, Miasto: {s.City}");
}

Console.WriteLine("\nTabela Products z dostawcami:");
var productsWithSuppliers = prodContext.Products
    .Include(p => p.Supplier)
    .ToList();

foreach (var p in productsWithSuppliers)
{
    string supplierInfo = p.Supplier != null ? p.Supplier.CompanyName : "Brak dostawcy";
    Console.WriteLine($"ID: {p.ProductId}, Produkt: {p.ProductName}, Ilość: {p.UnitsInStock}, Dostawca: {supplierInfo}");
}


Console.WriteLine("\nWynik zapytania SELECT * FROM Products JOIN Suppliers:");
var joinQuery = prodContext.Products
    .Join(prodContext.Suppliers,
        p => p.SupplierId,
        s => s.SupplierId,
        (p, s) => new
        {
            ProductId = p.ProductId,
            ProductName = p.ProductName,
            UnitsInStock = p.UnitsInStock,
            SupplierId = s.SupplierId,
            CompanyName = s.CompanyName,
            Street = s.Street,
            City = s.City
        })
    .ToList();

foreach (var item in joinQuery)
{
    Console.WriteLine($"Produkt: {item.ProductName}, Ilość: {item.UnitsInStock}, " +
                     $"Dostawca: {item.CompanyName}, Adres: {item.Street}, {item.City}");
}
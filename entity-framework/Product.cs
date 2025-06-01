
public class Product
{
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public int UnitsInStock { get; set; }
    public Supplier? Supplier { get; set; }
    // Dodano relację z Invoice
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
}
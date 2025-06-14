public class Invoice
{
    public int InvoiceId { get; set; }
    public int InvoiceNumber { get; set; }
    public int Quantity { get; set; }
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
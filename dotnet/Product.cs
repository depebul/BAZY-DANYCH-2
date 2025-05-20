public class Product
{
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public int UnitsInStock { get; set; }
    public int? SupplierId { get; set; }
    public virtual Supplier? Supplier { get; set; }
}
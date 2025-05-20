using System.Collections.Generic;

public class Supplier
{
    public int SupplierId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;


    public virtual ICollection<Product>? Products { get; set; }
}
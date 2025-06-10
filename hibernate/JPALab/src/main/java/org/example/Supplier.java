package org.example;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@SecondaryTable(name = "Address")
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int supplierID;
    private String companyName;

    @OneToMany
    @JoinColumn(name = "SUPPLIER_FK")
    private Set<Product> suppliedProducts = new HashSet<>();

    @Column(table = "Address")
    public String street;

    @Column(table = "Address")
    public String city;

    public Supplier() {
    }

    public Supplier(String companyName, String street, String city) {
        this.companyName = companyName;
        this.street = street;
        this.city = city;
    }


    public void addSuppliedProduct(Product product) {
        suppliedProducts.add(product);
    }


    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("Supplier ID: ").append(supplierID).append("\n");
        sb.append("Company Name: ").append(companyName).append("\n");
        sb.append("Address: ").append(street + ", " + city).append("\n");
        sb.append("Supplied Products:\n");
        for (Product product : suppliedProducts) {
            sb.append("- ").append(product.getProductName()).append("\n");
        }
        return sb.toString();
    }
}

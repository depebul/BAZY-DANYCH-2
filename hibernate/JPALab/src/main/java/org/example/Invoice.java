package org.example;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int invoiceID;

    private int number;
    private int quantity;

    @ManyToMany
    private Set<Product> products = new HashSet<>();

    public Invoice() {

    }

    public void addProduct(Product product, int quantity) {
        products.add(product);
        this.quantity += quantity;
        product.addToInvoice(this, quantity);
    }

    public void setNumber(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("Invoice ID: ").append(invoiceID).append("\n");
        sb.append("Number: ").append(number).append("\n");
        sb.append("Quantity: ").append(quantity).append("\n");
        sb.append("Products:\n");
        for (Product product : products) {
            sb.append("- ").append(product.getProductName()).append("\n");
        }
        return sb.toString();
    }
}

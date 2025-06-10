package org.example;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)

    private int categoryID;
    private String name;

    @OneToMany
    @JoinColumn(name = "CATEGORY_FK")
    private Set<Product> products = new HashSet<>();

    public Category() {

    }

    public Category(String name) {
        this.name = name;
    }

    public void addProduct(Product product) {
        products.add(product);
        product.setCategory(this);
    }

    public Set<Product> getProducts() {
        return this.products;
    }

    public String getName() {
        return this.name;
    }
}

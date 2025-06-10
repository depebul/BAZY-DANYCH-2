package org.example;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
public class Supplier extends Company{
    private String bankAccountNumber;
   

    public Supplier() {
    }

    public Supplier(String companyName, String street, String city, String zipCode ,String bankAccountNumber) {
        super(companyName, street, city, zipCode);
        this.bankAccountNumber = bankAccountNumber;
    }


    @Override
    public String toString() {
        return "Supplier ID: " + super.getCompanyID() + "\n" +
                "Bank Account Number: " + bankAccountNumber + "\n" +
                super.toString() +
                "\n";
    }
}

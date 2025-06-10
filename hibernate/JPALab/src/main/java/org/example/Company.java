package org.example;

import jakarta.persistence.*;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int companyID;
    private String companyName;
    private String street;
    private String city;
    private String zipCode;

    public Company() {

    }

    public Company(String companyName, String street, String city, String zipCode) {
        this.companyName = companyName;
        this.street = street;
        this.city = city;
        this.zipCode = zipCode;
    }

    @Override
    public String toString() {
        return "Company ID: " + companyID + "\n" +
                "Company Name: " + companyName + "\n" +
                "Address: " + street + ", " + city + ", " + zipCode + "\n";
    }

    public int getCompanyID() {
        return companyID;
    }
}

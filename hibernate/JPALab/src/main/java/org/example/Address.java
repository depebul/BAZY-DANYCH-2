package org.example;

import jakarta.persistence.Embeddable;

@Embeddable
public class Address {
    private String street;
    private String city;

    public Address() {

    }

    public Address(String street, String city) {
        this.street = street;
        this.city = city;
    }

    public String getStreet() {
        return street;
    }

    public String getCity() {
        return city;
    }

    public String getFullAddress() {
        return street + ", " + city;
    }
}

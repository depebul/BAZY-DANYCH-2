package org.example;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.EntityTransaction;
import jakarta.persistence.Persistence;

import java.util.List;

public class Main {
    public static void main(String[] args) {
        EntityManagerFactory emf = Persistence.createEntityManagerFactory("MyLabDatabase");
        EntityManager em = emf.createEntityManager();
        EntityTransaction etx = em.getTransaction();

        etx.begin();

        Supplier supplier1 = new Supplier("Buraki Sp. z o.o.", "Barszczowa", "Burakowo", "12345", "PL61109010140000071219812874");
        Supplier supplier2 = new Supplier("Ziemniaki Sp. z o.o.", "Ziemniaczana", "Ziemniakowo", "54321", "PL61109010140000071219812875");

        em.persist(supplier1);
        em.persist(supplier2);

        Customer customer1 = new Customer("Janex", "Warszawska", "Janów Lubelski", "30123", 0.2);
        Customer customer2 = new Customer("Kowalski", "Kowalska", "Kowalewo", "12345", 0.15);
        Customer customer3 = new Customer("JankoExpress", "Jana", "Janowo", "54321", 0.1);

        em.persist(customer1);
        em.persist(customer2);
        em.persist(customer3);

        var query = em.createQuery("SELECT s FROM Supplier s where s.companyName = 'Buraki Sp. z o.o.'", Supplier.class);
        Supplier customer = (Supplier) query.getSingleResult();
        System.out.println("Supplier found: " + customer);

        var query1 = em.createQuery("SELECT c FROM Customer c WHERE c.companyName = 'Janex'", Customer.class);
        Customer janex = (Customer) query1.getSingleResult();
        System.out.println("Customer found: " + janex);
        etx.commit();

        em.close();
    }
}
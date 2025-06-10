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

        Supplier supplier1 = new Supplier("Buraki Sp. z o.o.", "Barszczowa", "Burakowo");

        Supplier supplier2 = new Supplier("Ziemniaki Sp. z o.o.", "Ziemniaczana", "Ziemniakowo");

        em.persist(supplier1);
        em.persist(supplier2);

        var query = em.createQuery("SELECT s FROM Supplier s", Supplier.class);
        List<Supplier> suppliers = query.getResultList();

        for (Supplier supplier : suppliers) {
            System.out.println(supplier);
        }

        etx.commit();
    }
}
# Entity Framework

<style>
  {
    font-size: 16pt;
  }
</style> 

<style scoped>
 li, p {
    font-size: 14pt;
  }
</style> 

<style scoped>
 pre {
    font-size: 10pt;
  }
</style> 

## Autorzy: Szymon Migas, Dawid Żak

# Część I
Sprawdzamy zainstalowaną wersję Javy:
```bash
java -version
```

Wynik:
```
java version "21.0.2" 2024-01-16 LTS
Java(TM) SE Runtime Environment (build 21.0.2+13-LTS-58)
Java HotSpot(TM) 64-Bit Server VM (build 21.0.2+13-LTS-58, mixed mode, sharing)
```

Po pobraniu i rozpakowaniu serwera Derby, przechodzimy do katalogu `bin` i uruchamiamy serwer:
```bash
cd hibernate/db-derby-10.17.1.0-bin/bin
./startNetworkServer
```

Wynik na konsoli:
![Screen 1](screeny/000001.png)

Następnie w Intelliju tworzymy nowy projekt Mavenowy, w którym dodajemy zależności do Hibernate i Derby.

Tworzenie nowego projektu Mavenowego:
![Screen 2](screeny/000002.png)

Testowe uruchomienie projektu:
![Screen 3](screeny/000003.png)

Dodajemy zależności do pliku `pom.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
...

    <dependencies>
        <dependency>
            <groupId>org.hibernate</groupId>
            <artifactId>hibernate-core</artifactId>
            <version>6.4.4.Final</version>
        </dependency>

        <dependency>
            <groupId>org.apache.derby</groupId>
            <artifactId>derbyclient</artifactId>
            <version>10.17.1.0</version>
        </dependency>

        <dependency>
            <groupId>org.apache.derby</groupId>
            <artifactId>derbynet</artifactId>
            <version>10.17.1.0</version>
        </dependency>
    </dependencies>

</project>
```
Moduły w projekcie po przeładowaniu zależności:
![Screen 5](screeny/000005.png)

Kofiguracja Hibernate w pliku `hibernate.cfg.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE hibernate-configuration PUBLIC
        "-//Hibernate/Hibernate Configuration DTD 3.0//EN"
        "http://www.hibernate.org/dtd/hibernate-configuration-3.0.dtd">
<hibernate-configuration>
    <session-factory>

        <property name="connection.driver_class">
            org.apache.derby.jdbc.ClientDriver
        </property>

        <property name="connection.url">
            jdbc:derby://127.0.0.1/MyLabDatabase;create=true
        </property>


        <property name="show_sql">true</property>
        <property name="format_sql">true</property>
        <property name="use_sql_comments">true</property>
        <property name="hbm2ddl.auto">create-drop</property>

    </session-factory>
</hibernate-configuration>
```

Uzupełniamy klasę `Main`:

```java
package org.example;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

public class Main {
    private static SessionFactory sessionFactory = null;

    public static void main(String[] args) {
        sessionFactory = getSessionFactory();
        Session session = sessionFactory.openSession();
        session.close();
    }
    
    private static SessionFactory getSessionFactory() {
        if (sessionFactory == null) {
            Configuration configuration = new Configuration();
            sessionFactory = configuration.configure().buildSessionFactory();
        }
        return sessionFactory;
    }
}
```

Uruchamiamy projekt, aby sprawdzić, czy Hibernate poprawnie łączy się z bazą danych Derby:
![Screen 6](screeny/000006.png)

Dodajemy do Intellij bazę danych Derby:
![Screen 7](screeny/000007.png)

Widać że połączenie się powiodło, póki co otrzymujemy:
![Screen 8](screeny/000008.png)

Następnie w celu dodania do bazy danych nowych danych, tworzymy klasę `Product`:
```java
package org.example;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int productID;
    private String productName;
    private int unitsInStock;

    public Product() {

    }

    public Product(String productName, int unitsInStock) {
        this.productName = productName;
        this.unitsInStock = unitsInStock;
    }
}
```

Oraz w klasie `Main` dodajemy sekcję tworzącą nową transakcję i zapisującą do bazy danych nowy produkt:
```java
...
    public static void main(String[] args) {
        sessionFactory = getSessionFactory();
        Session session = sessionFactory.openSession();

// *******************************************************************
        Product product = new Product("Kredki", 100);
        Transaction tx = session.beginTransaction();
        session.persist(product);
        tx.commit();
 // *******************************************************************
        
        session.close();
    }

    ...
```

Ponieważ 
```java
    transaction.save(...);
```
jest przestarzałe od wersji 6.0, używamy:
```java
    session.persist(...);
```

Przed uruchomieniem projektu, dodajemy mapping klasy `Product` w pliku `hibernate.cfg.xml`:
```xml
...
    <mapping class="org.example.Product"/>
...
```

Wynik po uruchomieniu:
![Screen 9](screeny/000009.png)

W bazie danych pojawił się nowy produkt:
![Screen 10](screeny/000010.png)


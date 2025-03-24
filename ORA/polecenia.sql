-- Zadanie 0 - widoki
-- Dodanie do tabeli reservation kolumny no_tickets
ALTER TABLE
    reservation
ADD
    no_tickets INT DEFAULT 1;

-- Dodanie do tabeli log kolumny no_tickets
ALTER TABLE
    log
ADD
    no_tickets INT;

-- Dodanie osoby do bazy
INSERT INTO
    person (firstname, lastname)
VALUES
    ('Jan', 'Nowak');

-- Dodanie rezerwacji do bazy
INSERT INTO
    reservation (trip_id, person_id, status, no_tickets)
VALUES
    (1, 1, 'P', 2);

-- przykład zcommitowania danych
INSERT INTO
    person (firstname, lastname)
VALUES
    ('Anna', 'Wisniewska');

INSERT INTO
    reservation (trip_id, person_id, status, no_tickets)
VALUES
    (4, 24, 'N', 1);

COMMIT;

-- sprawdzenie funkcji rollback, czy działa
UPDATE
    reservation
SET
    status = 'P'
WHERE
    reservation_id = 2;

SELECT
    *
FROM
    reservation
WHERE
    reservation_id = 2;

ROLLBACK;

SELECT
    *
FROM
    reservation
WHERE
    reservation_id = 2;

-- Zadanie 1 - widoki
-- vw_reservation
CREATE
OR REPLACE VIEW vw_reservation AS
SELECT
    r.reservation_id,
    t.country,
    t.trip_date,
    t.trip_name,
    p.firstname,
    p.lastname,
    r.status,
    r.trip_id,
    r.person_id,
    r.no_tickets
FROM
    reservation r
    JOIN trip t ON r.trip_id = t.trip_id
    JOIN person p ON r.person_id = p.person_id;

-- vw_trip
CREATE
OR REPLACE VIEW vw_trip AS
SELECT
    t.trip_id,
    t.country,
    t.trip_date,
    t.trip_name,
    t.max_no_places,
    t.max_no_places - NVL(SUM(r.no_tickets), 0) AS no_available_places
FROM
    trip t
    LEFT JOIN reservation r ON t.trip_id = r.trip_id
    AND r.status != 'C'
GROUP BY
    t.trip_id,
    t.country,
    t.trip_date,
    t.trip_name,
    t.max_no_places;

-- vw_available_trip
CREATE
OR REPLACE VIEW vw_available_trip AS
SELECT
    trip_id,
    country,
    trip_date,
    trip_name,
    max_no_places,
    no_available_places
FROM
    vw_trip
WHERE
    trip_date > SYSDATE
    AND no_available_places > 0;

-- Zadanie 2 - funkcje
-- f_trip_participants



-- f_person_reservations



-- f_available_trips_to
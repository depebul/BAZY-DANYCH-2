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
INSERT INTO person (firstname, lastname)
VALUES ('Jan', 'Nowak');

-- Dodanie rezerwacji do bazy
INSERT INTO reservation (trip_id, person_id, status, no_tickets)
VALUES (1, 1, 'P', 2);

-- przykład zcommitowania danych
INSERT INTO person (firstname, lastname)
VALUES ('Anna', 'Wisniewska');

INSERT INTO reservation (trip_id, person_id, status, no_tickets)
VALUES (4, 24, 'N', 1);

COMMIT;

-- sprawdzenie funkcji rollback, czy działa
UPDATE
    reservation
SET status = 'P'
WHERE reservation_id = 2;

SELECT *
FROM reservation
WHERE reservation_id = 2;

ROLLBACK;

SELECT *
FROM reservation
WHERE reservation_id = 2;

-- Zadanie 1 - widoki
-- vw_reservation
CREATE OR REPLACE VIEW vw_reservation AS
SELECT r.reservation_id,
       t.country,
       t.trip_date,
       t.trip_name,
       p.firstname,
       p.lastname,
       r.status,
       r.trip_id,
       r.person_id,
       r.no_tickets
FROM reservation r
         JOIN trip t ON r.trip_id = t.trip_id
         JOIN person p ON r.person_id = p.person_id;

-- vw_trip
CREATE OR REPLACE VIEW vw_trip AS
SELECT t.trip_id,
       t.country,
       t.trip_date,
       t.trip_name,
       t.max_no_places,
       t.max_no_places - NVL(SUM(r.no_tickets), 0) AS no_available_places
FROM trip t
         LEFT JOIN reservation r ON t.trip_id = r.trip_id
    AND r.status != 'C'
GROUP BY t.trip_id,
         t.country,
         t.trip_date,
         t.trip_name,
         t.max_no_places;

-- vw_available_trip
CREATE OR REPLACE VIEW vw_available_trip AS
SELECT trip_id,
       country,
       trip_date,
       trip_name,
       max_no_places,
       no_available_places
FROM vw_trip
WHERE trip_date > SYSDATE
  AND no_available_places > 0;

-- Zadanie 2 - funkcje
-- Tworzenie typu danych podobnych do widoku

-- reservation_info
CREATE OR REPLACE TYPE reservation_info AS OBJECT
(
    RESERVATION_ID NUMBER,
    COUNTRY        VARCHAR2(50),
    TRIP_DATE      DATE,
    TRIP_NAME      VARCHAR2(100),
    FIRSTNAME      VARCHAR2(50),
    LASTNAME       VARCHAR2(50),
    STATUS         CHAR,
    TRIP_ID        NUMBER,
    PERSON_ID      NUMBER,
    NO_TICKETS     NUMBER
);

CREATE OR REPLACE TYPE reservation_info_table IS TABLE OF reservation_info;


-- trips_info
create type available_trips_info as object
(
    TRIP_ID             NUMBER,
    COUNTRY             VARCHAR2(50),
    TRIP_DATE           DATE,
    TRIP_NAME           VARCHAR2(100),
    MAX_NO_PLACES       NUMBER,
    NO_AVAILABLE_PLACES NUMBER
);

create type available_trips_info_table is table of available_trips_info;
-- f_trip_participants
create or replace function f_trip_participants(trip_id varchar)
    return reservation_info_table
as
    result reservation_info_table;
begin
    select RESERVATION_INFO(vw.RESERVATION_ID, vw.COUNTRY, vw.TRIP_DATE, vw.TRIP_NAME, vw.FIRSTNAME, vw.LASTNAME,
                            vw.STATUS, vw.TRIP_ID, vw.PERSON_ID, vw.NO_TICKETS) bulk collect
    into result
    from vw_reservation vw
    where vw.trip_id = f_trip_participants.trip_id;
    return result;
end;

select *
from f_trip_participants(1)

-- f_person_reservations
         create or
replace
function
f_person_reservation
(
person_id
NUMBER
)
return
RESERVATION_INFO_TABLE
as
result
RESERVATION_INFO_TABLE;
begin
    select RESERVATION_INFO(vw.RESERVATION_ID, vw.COUNTRY, vw.TRIP_DATE, vw.TRIP_NAME, vw.FIRSTNAME, vw.LASTNAME,
                            vw.STATUS, vw.TRIP_ID, vw.PERSON_ID, vw.NO_TICKETS) bulk collect
    into result
    from VW_RESERVATION vw
    where vw.PERSON_ID = f_person_reservation.person_id;

    return result;
end;

select *
from f_person_reservation(1);

-- f_available_trips_to


-- zadanie 3 - procedury
-- p_add_reservation

create or replace procedure p_add_reservation(trip_id int, person_id int, no_tickets int)
as
    v_trip_date        DATE;
    v_available_places NUMBER;
    v_reservation_id   NUMBER;
begin
    SELECT trip_date, no_available_places
    INTO v_trip_date, v_available_places
    FROM vw_trip
    WHERE trip_id = p_add_reservation.trip_id;

    IF v_trip_date < SYSDATE THEN
        RETURN;
    END IF;

    IF v_available_places < no_tickets THEN
        RETURN;
    END IF;

    INSERT INTO RESERVATION (trip_id, person_id, status, no_tickets)
    VALUES (trip_id, person_id, 'N', no_tickets)
    RETURNING reservation_id INTO v_reservation_id;

    INSERT INTO LOG (reservation_id, log_date, status, no_tickets)
    VALUES (v_reservation_id, SYSDATE, 'N', no_tickets);
end;

-- p_modify_reservation_status


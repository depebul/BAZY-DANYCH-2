-- Zadanie 0 - widoki
-- Dodanie do tabeli reservation kolumny no_tickets
-- ALTER TABLE
--     reservation
--     ADD
--         no_tickets INT DEFAULT 1;

-- -- Dodanie do tabeli log kolumny no_tickets
-- ALTER TABLE
--     log
--     ADD
--         no_tickets INT;

-- Dodanie osoby do bazy
-- INSERT INTO person (firstname, lastname)
-- VALUES ('Jan', 'Nowak');

-- -- Dodanie rezerwacji do bazy
-- INSERT INTO reservation (trip_id, person_id, status, no_tickets)
-- VALUES (1, 1, 'P', 2);

-- -- przykład zcommitowania danych
-- INSERT INTO person (firstname, lastname)
-- VALUES ('Anna', 'Wisniewska');

-- INSERT INTO reservation (trip_id, person_id, status, no_tickets)
-- VALUES (4, 24, 'N', 1);

-- insert into trip(trip_name, country, trip_date, max_no_places)
-- values ('Wycieczka do Paryza', 'Francja', to_date('2026-09-12', 'YYYY-MM-DD'), 3);

-- INSERT INTO TRIP ( TRIP_NAME, COUNTRY, TRIP_DATE, MAX_NO_PLACES)
-- VALUES  ( 'kocham holandie', 'Holandia', to_date('2026-09-12', 'YYYY-MM-DD'), 20);

-- COMMIT;

-- sprawdzenie funkcji rollback, czy działa
-- UPDATE
--     reservation
-- SET status = 'P'
-- WHERE reservation_id = 2;

-- SELECT *
-- FROM reservation
-- WHERE reservation_id = 2;

-- ROLLBACK;

-- SELECT *
-- FROM reservation
-- WHERE reservation_id = 2;

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
create or replace type available_trips_info as object
(
    TRIP_ID             NUMBER,
    COUNTRY             VARCHAR2(50),
    TRIP_DATE           DATE,
    TRIP_NAME           VARCHAR2(100),
    MAX_NO_PLACES       NUMBER,
    NO_AVAILABLE_PLACES NUMBER
);

create or replace type available_trips_info_table is table of available_trips_info;
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

-- select *
-- from f_trip_participants(1)

-- f_person_reservations
create or replace function
    f_person_reservation(
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

-- select *
-- from f_person_reservation(1);

-- f_available_trips_to
create or replace function f_available_trips_to(country varchar2, date_from DATE, date_to DATE)
    return AVAILABLE_TRIPS_INFO_TABLE
as
    result AVAILABLE_TRIPS_INFO_TABLE;
begin
    select AVAILABLE_TRIPS_INFO(vw.TRIP_ID, vw.COUNTRY, vw.TRIP_DATE, vw.TRIP_NAME, vw.MAX_NO_PLACES,
                                vw.NO_AVAILABLE_PLACES) bulk collect
    into result
    from VW_AVAILABLE_TRIP vw
    where vw.COUNTRY = f_available_trips_to.country
      and vw.TRIP_DATE between date_from and date_to;
    return result;
end;
/



-- zadanie 3 - procedury
-- p_add_reservation

create procedure p_add_reservation(trip_id int, person_id int, no_tickets int)
as
    v_trip_date        DATE;
    v_available_places NUMBER;
    v_reservation_id   NUMBER;
    v_count            NUMBER;
begin

    SELECT COUNT(*)
    INTO v_count
    FROM trip
    WHERE trip_id = p_add_reservation.trip_id;

    IF v_count = 0 THEN
        RETURN;
    END IF;

    SELECT COUNT(*)
    INTO v_count
    FROM person
    WHERE person_id = p_add_reservation.person_id;

    IF v_count = 0 THEN
        RETURN;
    END IF;

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

    COMMIT;
end;
/


-- p_modify_reservation_status

create or replace procedure p_modify_reservation_status(p_reservation_id INT, p_status CHAR)
as
    v_current_status   CHAR(1);
    v_trip_id          NUMBER;
    v_no_tickets       NUMBER;
    v_trip_date        DATE;
    v_available_places NUMBER;
    v_count            NUMBER;
begin
    SELECT COUNT(*)
    INTO v_count
    FROM reservation
    WHERE reservation_id = p_reservation_id;

    IF v_count = 0 THEN
        RETURN;
    END IF;

    SELECT status, trip_id, no_tickets
    INTO v_current_status, v_trip_id, v_no_tickets
    FROM reservation
    WHERE reservation_id = p_reservation_id;


    IF v_current_status = p_status THEN
        RETURN;
    END IF;

    SELECT trip_date, no_available_places
    INTO v_trip_date, v_available_places
    FROM vw_trip
    WHERE trip_id = v_trip_id;


    IF v_trip_date < SYSDATE THEN
        RETURN;
    END IF;

    IF v_current_status = 'C' AND (p_status = 'P' OR p_status = 'N') THEN

        SELECT COUNT(*)
        INTO v_count
        FROM trip
        WHERE trip_id = v_trip_id;

        IF v_count = 0 THEN
            RETURN;
        END IF;


        IF v_available_places < v_no_tickets THEN
            RETURN;
        END IF;
    END IF;


    UPDATE reservation
    SET status = p_status
    WHERE reservation_id = p_reservation_id;


    INSERT INTO LOG (reservation_id, log_date, status, no_tickets)
    VALUES (p_reservation_id, SYSDATE, p_status, v_no_tickets);
end;
/

-- p_modify_reservation

create or replace procedure p_modify_reservation(p_reservation_id INT, p_no_tickets INT)
as
    v_current_tickets    NUMBER;
    v_status             CHAR(1);
    v_trip_id            NUMBER;
    v_trip_date          DATE;
    v_available_places   NUMBER;
    v_count              NUMBER;
    v_additional_tickets NUMBER;
begin

    SELECT COUNT(*)
    INTO v_count
    FROM reservation
    WHERE reservation_id = p_reservation_id;

    IF v_count = 0 THEN
        RETURN;
    END IF;


    SELECT no_tickets, status, trip_id
    INTO v_current_tickets, v_status, v_trip_id
    FROM reservation
    WHERE reservation_id = p_reservation_id;


    IF v_current_tickets = p_no_tickets THEN
        RETURN;
    END IF;


    SELECT trip_date, no_available_places
    INTO v_trip_date, v_available_places
    FROM vw_trip
    WHERE trip_id = v_trip_id;

    IF v_trip_date < SYSDATE THEN
        RETURN;
    END IF;


    IF v_status != 'C' AND p_no_tickets > v_current_tickets THEN

        v_additional_tickets := p_no_tickets - v_current_tickets;


        SELECT COUNT(*)
        INTO v_count
        FROM trip
        WHERE trip_id = v_trip_id;

        IF v_count = 0 THEN
            RETURN;
        END IF;

        IF v_available_places < v_additional_tickets THEN
            RETURN;
        END IF;
    END IF;


    UPDATE reservation
    SET no_tickets = p_no_tickets
    WHERE reservation_id = p_reservation_id;

    INSERT INTO LOG (reservation_id, log_date, status, no_tickets)
    VALUES (p_reservation_id, SYSDATE, v_status, p_no_tickets);
end;
/
-- p_modify_max_no_places

create or replace procedure p_modify_max_no_places(
    p_trip_id IN NUMBER,
    p_max_no_places IN NUMBER
)
as
    v_current_max_places NUMBER;
    v_reserved_places    NUMBER;
    v_count              NUMBER;
begin

    SELECT COUNT(*)
    INTO v_count
    FROM vw_trip
    WHERE trip_id = p_trip_id;

    IF v_count = 0 THEN
        RETURN;
    END IF;


    SELECT max_no_places, (max_no_places - no_available_places)
    INTO v_current_max_places, v_reserved_places
    FROM vw_trip
    WHERE trip_id = p_trip_id;


    IF v_current_max_places = p_max_no_places THEN
        RETURN;
    END IF;


    IF p_max_no_places < v_reserved_places THEN
        RETURN;
    END IF;


    UPDATE trip
    SET max_no_places = p_max_no_places
    WHERE trip_id = p_trip_id;
end;

-- Zadanie 4 - triggery

-- Trigger to log new reservations
CREATE OR REPLACE TRIGGER tr_reservation_insert_log
    AFTER INSERT
    ON reservation
    FOR EACH ROW
BEGIN
    INSERT INTO log (reservation_id, log_date, status, no_tickets)
    VALUES (:NEW.reservation_id, SYSDATE, :NEW.status, :NEW.no_tickets);
END;
/

-- Trigger to log status changes
CREATE OR REPLACE TRIGGER tr_reservation_status_update_log
    AFTER UPDATE OF status
    ON reservation
    FOR EACH ROW
    WHEN (OLD.status != NEW.status)
BEGIN
    INSERT INTO log (reservation_id, log_date, status, no_tickets)
    VALUES (:NEW.reservation_id, SYSDATE, :NEW.status, :NEW.no_tickets);
END;
/

-- Trigger to log ticket count changes
CREATE OR REPLACE TRIGGER tr_reservation_tickets_update_log
    AFTER UPDATE OF no_tickets
    ON reservation
    FOR EACH ROW
    WHEN (OLD.no_tickets != NEW.no_tickets)
BEGIN
    INSERT INTO log (reservation_id, log_date, status, no_tickets)
    VALUES (:NEW.reservation_id, SYSDATE, :NEW.status, :NEW.no_tickets);
END;
/

-- Trigger to prevent reservation deletion
CREATE OR REPLACE TRIGGER tr_prevent_reservation_delete
    BEFORE DELETE
    ON reservation
    FOR EACH ROW
BEGIN
    RAISE_APPLICATION_ERROR(-20001, 'Deletion of reservations is not allowed');
END;
/
-- Modyfikacja p_add_reservation_4
create procedure p_add_reservation_4(trip_id int, person_id int, no_tickets int)
as
    v_trip_date        DATE;
    v_available_places NUMBER;
    v_reservation_id   NUMBER;
    v_count            NUMBER;
begin

    SELECT COUNT(*)
    INTO v_count
    FROM trip
    WHERE trip_id = p_add_reservation_4.trip_id;

    IF v_count = 0 THEN
        RETURN;
    END IF;

    SELECT COUNT(*)
    INTO v_count
    FROM person
    WHERE person_id = p_add_reservation_4.person_id;

    IF v_count = 0 THEN
        RETURN;
    END IF;
    SELECT trip_date, no_available_places
    INTO v_trip_date, v_available_places
    FROM vw_trip
    WHERE trip_id = p_add_reservation_4.trip_id;

    IF v_trip_date < SYSDATE THEN
        RETURN;
    END IF;

    IF v_available_places < no_tickets THEN
        RETURN;
    END IF;

    INSERT INTO RESERVATION (trip_id, person_id, status, no_tickets)
    VALUES (trip_id, person_id, 'N', no_tickets)
    RETURNING reservation_id INTO v_reservation_id;
end;
/


-- Modyfikacja p_modify_reservation_status_4

create or replace procedure p_modify_reservation_status_4(p_reservation_id INT, p_status CHAR)
as
    v_current_status   CHAR(1);
    v_trip_id          NUMBER;
    v_no_tickets       NUMBER;
    v_trip_date        DATE;
    v_available_places NUMBER;
    v_count            NUMBER;
begin
    SELECT COUNT(*)
    INTO v_count
    FROM reservation
    WHERE reservation_id = p_reservation_id;

    IF v_count = 0 THEN
        RETURN;
    END IF;

    SELECT status, trip_id, no_tickets
    INTO v_current_status, v_trip_id, v_no_tickets
    FROM reservation
    WHERE reservation_id = p_reservation_id;


    IF v_current_status = p_status THEN
        RETURN;
    END IF;

    SELECT trip_date, no_available_places
    INTO v_trip_date, v_available_places
    FROM vw_trip
    WHERE trip_id = v_trip_id;


    IF v_trip_date < SYSDATE THEN
        RETURN;
    END IF;

    IF v_current_status = 'C' AND (p_status = 'P' OR p_status = 'N') THEN

        SELECT COUNT(*)
        INTO v_count
        FROM trip
        WHERE trip_id = v_trip_id;

        IF v_count = 0 THEN
            RETURN;
        END IF;


        IF v_available_places < v_no_tickets THEN
            RETURN;
        END IF;
    END IF;


    UPDATE reservation
    SET status = p_status
    WHERE reservation_id = p_reservation_id;
end;
/


-- p_modify_reservation_4

create or replace procedure p_modify_reservation_4(p_reservation_id INT, p_no_tickets INT)
as
    v_current_tickets    NUMBER;
    v_status             CHAR(1);
    v_trip_id            NUMBER;
    v_trip_date          DATE;
    v_available_places   NUMBER;
    v_count              NUMBER;
    v_additional_tickets NUMBER;
begin

    SELECT COUNT(*)
    INTO v_count
    FROM reservation
    WHERE reservation_id = p_reservation_id;

    IF v_count = 0 THEN
        RETURN;
    END IF;


    SELECT no_tickets, status, trip_id
    INTO v_current_tickets, v_status, v_trip_id
    FROM reservation
    WHERE reservation_id = p_reservation_id;


    IF v_current_tickets = p_no_tickets THEN
        RETURN;
    END IF;


    SELECT trip_date, no_available_places
    INTO v_trip_date, v_available_places
    FROM vw_trip
    WHERE trip_id = v_trip_id;


    IF v_trip_date < SYSDATE THEN
        RETURN;
    END IF;


    IF v_status != 'C' AND p_no_tickets > v_current_tickets THEN

        v_additional_tickets := p_no_tickets - v_current_tickets;


        SELECT COUNT(*)
        INTO v_count
        FROM trip
        WHERE trip_id = v_trip_id;

        IF v_count = 0 THEN
            RETURN;
        END IF;


        IF v_available_places < v_additional_tickets THEN
            RETURN;
        END IF;
    END IF;


    UPDATE reservation
    SET no_tickets = p_no_tickets
    WHERE reservation_id = p_reservation_id;
end;
/

-- Zadanie 5 - triggery

-- TR_INSERT_RESERVATION

create or replace trigger TR_INSERT_RESERVATION
    before insert
    on RESERVATION
    for each row
declare
    v_count            int;
    v_trip_date        date;
    v_available_places int;
begin
    select count(*)
    into v_count
    from trip t
    where t.trip_id = :new.trip_id;

    if v_count = 0 then
        RAISE_APPLICATION_ERROR(-20010, 'Trip does not exist!');
    end if;

    select count(*)
    into v_count
    from person p
    where p.person_id = :new.person_id;

    if v_count = 0 then
        RAISE_APPLICATION_ERROR(-20020, 'Person does not exist!');
    end if;

    select trip_date, no_available_places
    into v_trip_date, v_available_places
    from vw_trip
    where trip_id = :new.trip_id;

    if v_trip_date < SYSDATE then
        RAISE_APPLICATION_ERROR(-20030, 'Trip date from the past!');
    end if;

    IF v_available_places < :new.no_tickets then
        RAISE_APPLICATION_ERROR(-20040, 'No available tickets!');
    end if;

end;

-- TR_RESERVATION_UPDATE

create trigger TR_RESERVATION_UPDATE
    before update
    on RESERVATION
    for each row
declare
    v_count            int;
    v_trip_date        date;
    v_available_places int;
begin
    select count(*)
    into v_count
    from reservation r
    where r.reservation_id = :new.reservation_id;

    if v_count = 0 then
        RAISE_APPLICATION_ERROR(-20020, 'Reservation does not exist!');
    end if;

    select trip_date, no_available_places
    into v_trip_date, v_available_places
    from vw_trip
    where trip_id = :new.trip_id;


    if v_trip_date < SYSDATE then
        RAISE_APPLICATION_ERROR(-20030, 'Trip date from the past!');
    end if;

    IF :old.status = 'C' AND (:new.status = 'P') THEN
        SELECT COUNT(*)
        INTO v_count
        FROM trip
        WHERE trip_id = :old.trip_id;

        IF v_count = 0 THEN
            RETURN;
        END IF;

        IF v_available_places < :new.no_tickets THEN
            RAISE_APPLICATION_ERROR(-20040, 'No available tickets!');
        END IF;
    END IF;

    if v_available_places < :new.no_tickets - :old.no_tickets then
        RAISE_APPLICATION_ERROR(-20040, 'No available tickets!');
    end if;

end;




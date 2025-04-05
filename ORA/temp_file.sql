create or replace trigger TR_CHANGE_RESERVATION_STATUS
    before insert or update
    on RESERVATION
    for each row
declare
    v_count int;
    v_trip_date date;
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
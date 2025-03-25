create or replace procedure p_modify_reservation_status(p_reservation_id IN INT, p_status IN CHAR)
as
    v_current_status CHAR(1);
    v_trip_id NUMBER;
    v_no_tickets NUMBER;
    v_trip_date DATE;
    v_available_places NUMBER;
    v_count NUMBER;
begin
    SELECT COUNT(*) INTO v_count
    FROM reservation
    WHERE reservation_id = p_reservation_id;
    
    IF v_count = 0 THEN
        RETURN; 
    END IF;
    
    -- Get current reservation information
    SELECT status, trip_id, no_tickets
    INTO v_current_status, v_trip_id, v_no_tickets
    FROM reservation
    WHERE reservation_id = p_reservation_id;
    
    -- Check if status is actually changing
    IF v_current_status = p_status THEN
        RETURN; -- No change needed
    END IF;
    
    -- If trying to reactivate a canceled reservation (C -> P or C -> N)
    IF v_current_status = 'C' AND (p_status = 'P' OR p_status = 'N') THEN
        -- Check if trip exists
        SELECT COUNT(*) INTO v_count
        FROM trip
        WHERE trip_id = v_trip_id;
        
        IF v_count = 0 THEN
            RETURN; -- Trip not found, silently exit
        END IF;
        
        -- Get trip info
        SELECT trip_date, no_available_places 
        INTO v_trip_date, v_available_places
        FROM vw_trip
        WHERE trip_id = v_trip_id;
        
        -- Validate trip date
        IF v_trip_date < SYSDATE THEN
            RETURN; -- Trip already happened, silently exit
        END IF;
        
        -- Validate available places
        IF v_available_places < v_no_tickets THEN
            RETURN; -- Not enough places, silently exit
        END IF;
    END IF;
    
    -- Update the reservation status
    UPDATE reservation
    SET status = p_status
    WHERE reservation_id = p_reservation_id;
    
    -- Log the status change
    INSERT INTO LOG (reservation_id, log_date, status, no_tickets)
    VALUES (p_reservation_id, SYSDATE, p_status, v_no_tickets);
    
    COMMIT;
end;
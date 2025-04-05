CREATE OR REPLACE PROCEDURE p_modify_reservation_status_6a(p_reservation_id INT, p_status CHAR)
AS
    v_count NUMBER;
    v_current_status CHAR(1);
    v_trip_id NUMBER;
    v_no_tickets NUMBER;
    v_old_count NUMBER := 0;
    v_new_count NUMBER := 0;
BEGIN
    SELECT COUNT(*) INTO v_count
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
    

    IF v_current_status != 'C' AND p_status = 'C' THEN

        v_old_count := v_no_tickets;
    ELSIF v_current_status = 'C' AND p_status != 'C' THEN

        v_new_count := v_no_tickets;
    END IF;
    
    BEGIN

        UPDATE reservation
        SET status = p_status
        WHERE reservation_id = p_reservation_id;
        

        IF v_old_count > 0 OR v_new_count > 0 THEN
            UPDATE trip
            SET no_available_places = no_available_places + (v_old_count - v_new_count)
            WHERE trip_id = v_trip_id;
        END IF;
        

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
    END;
END;
/


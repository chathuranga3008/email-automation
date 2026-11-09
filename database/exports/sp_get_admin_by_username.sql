DELIMITER $$

CREATE PROCEDURE sp_get_admin_by_username(
    IN p_username VARCHAR(100)
)
BEGIN
    SELECT
        username,
        password_hash,
        is_active
    FROM admin_users
    WHERE username = p_username
    LIMIT 1;
END$$

DELIMITER ;
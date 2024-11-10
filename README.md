
# Node.js database based Login and Registration System with Password Rotation

This project is a secure, modular login and registration system using Node.js and MariaDB. It includes password encryption with AES, automated monthly key rotation, and uses stored procedures for all database interactions.

## Features

- **User Registration and Login**: Secure registration and login with AES encryption for passwords.
- **Database Procedures**: All logic for user management and key rotation is handled with stored procedures in MariaDB.
- **Environment-Based Configuration**: Secure key management with environment variables.

## Prerequisites

- **MariaDB** (or MySQL, with minor modifications)
- **Node.js** (v14+)
- **npm**
- **`dotenv`**: For environment variable management

## Project Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/login-system.git
   cd login-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```plaintext
   MASTER_KEY=your_initial_master_key
   NEW_MASTER_KEY=your_new_master_key_for_rotation
   DB_HOST=your_db_host
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   ```

4. **Database Setup**: Run the following SQL commands in your MariaDB database to create the necessary table and stored procedures.

   ```sql
   -- Create   the    users table
   CREATE TABLE users (
       user_id INT AUTO_INCREMENT PRIMARY KEY,
       username VARCHAR(255) UNIQUE NOT NULL,
       encrypted_password VARBINARY(255) NOT NULL,
       key_version INT NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Register Procedure
   DELIMITER //
   CREATE PROCEDURE RegisterUser(
       IN p_username VARCHAR(255),
       IN p_password VARCHAR(255),
       IN p_master_key VARCHAR(255),
       IN p_key_version INT
   )
   BEGIN
       DECLARE encrypted_password VARBINARY(255);
       SET encrypted_password = AES_ENCRYPT(p_password, p_master_key);
       INSERT INTO users (username, encrypted_password, key_version)
       VALUES (p_username, encrypted_password, p_key_version);
   END //
   DELIMITER ;

   -- Login   Procedure
   DELIMITER //
   CREATE PROCEDURE LoginUser(
       IN p_username VARCHAR(255),
       IN p_password VARCHAR(255),
       IN p_master_key VARCHAR(255)
   )
   BEGIN
       DECLARE db_password VARBINARY(255);
       DECLARE db_key_version INT;

       SELECT encrypted_password, key_version INTO db_password, db_key_version
       FROM users
       WHERE username = p_username;

       IF AES_DECRYPT(db_password, p_master_key) = p_password THEN
           SELECT 'Login successful' AS message;
       ELSE
           SELECT 'Invalid username or password' AS message;
       END IF;
   END //
   DELIMITER ;

   -- Key   Rotation    Procedure
   DELIMITER //
   CREATE PROCEDURE RotateKey(
       IN p_old_key VARCHAR(255),
       IN p_new_key VARCHAR(255),
       IN p_new_key_version INT
   )
   BEGIN
       DECLARE done INT DEFAULT 0;
       DECLARE cur_user_id INT;
       DECLARE old_password VARBINARY(255);
       DECLARE decrypted_password VARCHAR(255);
       DECLARE cur CURSOR FOR SELECT user_id, encrypted_password FROM users WHERE key_version != p_new_key_version;
       DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

       OPEN cur;

       read_loop: LOOP
           FETCH cur INTO cur_user_id, old_password;
           IF done THEN
               LEAVE read_loop;
           END IF;

           SET decrypted_password = AES_DECRYPT(old_password, p_old_key);
           UPDATE users
           SET encrypted_password = AES_ENCRYPT(decrypted_password, p_new_key),
               key_version = p_new_key_version
           WHERE user_id = cur_user_id;
       END LOOP;

       CLOSE cur;
   END //
   DELIMITER ;
   ```

## Usage

### Registering a User

To register a new user, use the `registerUser` function:

```javascript
import { registerUser } from './auth.js';

await registerUser("newuser", "password123", 1);
```

### Logging in a User

To log in an existing user, use the `loginUser` function:

```javascript
import { loginUser } from './auth.js';

await loginUser("newuser", "password123");

## Running the Application

To run the application, use:

```bash
node index.js
```


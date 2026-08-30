CREATE DATABASE IF NOT EXISTS restaurant_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE restaurant_management;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(100),
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(100) UNIQUE,
    address VARCHAR(255),
    gender ENUM('MALE', 'FEMALE'),
    role ENUM('CUSTOMER', 'STAFF', 'DRIVER') NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS booking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    booking_time DATETIME NOT NULL,
    number_of_people INT NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    CONSTRAINT fk_booking_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50),
    img VARCHAR(255),
    category ENUM('APPETIZERS_SALADS', 'MAIN_COURSE', 'DESSERTS', 'DRINK') NOT NULL,
    description TEXT,
    is_available ENUM('AVAILABLE', 'UNAVAILABLE') NOT NULL DEFAULT 'AVAILABLE'
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    driver_id INT NULL,
    order_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    address VARCHAR(255),
    order_status ENUM(
        'PENDING',
        'ACCEPTED',
        'CANCELLED',
        'DELIVERY',
        'DELIVERING',
        'COMPLETED',
        'INCOMPLETE'
    ) NOT NULL DEFAULT 'PENDING',
    note TEXT,
    items_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_orders_driver
        FOREIGN KEY (driver_id) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS order_detail (
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL,
    PRIMARY KEY (order_id, menu_item_id),
    CONSTRAINT fk_order_detail_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_order_detail_item
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

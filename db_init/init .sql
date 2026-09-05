CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00
);

INSERT INTO accounts (name, balance) VALUES ('GBM VWRA', 38000.00);
INSERT INTO accounts (name, balance) VALUES ('Cajita Nu', 9000.00);
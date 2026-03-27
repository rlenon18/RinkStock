INSERT INTO Vendor (Address, City, Province, Postal_Code, Phone, Type, Name, Email)
    VALUES ('123 Maple St', 'London', 'ON', 'N1N-1N1', '(555)555-5551', 'Trusted', 'ABC Supply Co.', 'abc@supply.com');
INSERT INTO Vendor (Address, City, Province, Postal_Code, Phone, Type, Name, Email)
    VALUES ('543 Sycamore Ave', 'Toronto', 'ON', 'N1P-1N2', '(999)555-5552', 'Trusted', 'Big Bills Depot', 'bb@depot.com');
INSERT INTO Vendor (Address, City, Province, Postal_Code, Phone, Type, Name, Email)
    VALUES ('922 Oak St', 'London', 'ON', 'N1N-1N3', '(555)555-5593', 'Untrusted', 'Shady Sams', 'ss@underthetable.com');
INSERT INTO Vendor (Address, City, Province, Postal_Code, Phone, Type, Name, Email)
    VALUES ('123 Streety St.', 'London', 'ON', 'N1N-1N4', '(555)555-55594', 'Trusted', 'Roed Lenon', 'r_lenon@fanshaweonline.ca');

INSERT INTO Product (ID, Vendor_ID, Name, Cost, MSRP, ROP, EOQ, QOH, QOO)
   VALUES ('P-01', 4, 'Hockey Stick - Pro Carbon', 120, 160, 10, 10, 25, 5);

INSERT INTO Product (ID, Vendor_ID, Name, Cost, MSRP, ROP, EOQ, QOH, QOO)
   VALUES ('P-02', 4, 'Goalie Mask - Elite Series', 250, 320, 5, 5, 8, 2);

INSERT INTO Product (ID, Vendor_ID, Name, Cost, MSRP, ROP, EOQ, QOH, QOO)
   VALUES ('P-03', 4, 'Hockey Skates - SpeedBlade X', 180, 240, 8, 8, 15, 3);

INSERT INTO Product (ID, Vendor_ID, Name, Cost, MSRP, ROP, EOQ, QOH, QOO)
   VALUES ('P-04', 4, 'Test', 180, 240, 2, 10, 5, 1);
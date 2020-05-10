The webpage is currently set up to support a locally hosted MySQL database. To do so, install the MySQL program for your machine.
A password should be generated for you some time during the installation process.

To start the MySQL server, type:

    mysql.server start

in the terminal.


To access the root account for your MySQL server, type:

    mysql -u root -p

in the terminal and enter the password generated for you at installation.


The webpage is set up to use an account with the username 'user', and password 'pass'. To set this up, type the following commands:

    CREATE USER 'user'@'localhost' IDENTIFIED BY 'pass';
    GRANT ALL PRIVILEGES ON mydb.* TO 'user'@'localhost';
    FLUSH PRIVILEGES;

This will grant the user 'user' all privileges on all tables in a database called 'mydb'.
FLUSH PRIVILEGES is used to refresh privileges without restarting the server.


NOTE: THERE ARE TWO METHODS FOR CREATING THE NECESSARY TABLES

Method A: I've including a file named dump.txt, which you may be able to use to import my database using:

    mysql -u user -p mydb < dump.txt


Method B:

While you're still in the MySQL shell, type the following to create the necessary tables:

    CREATE TABLE data ( id varchar(225), date varchar(225), account varchar(225), type varchar(225), security varchar(225), amount varchar(225), dAmount varchar(225), costBasis varchar(225) );
    CREATE TABLE types ( typename varchar(225) );

This creates columns with the data type of varchar(225), which is a variable length string. This way, all data is stored exactly as it is in the table, without needing to modifying on read and writes.


To exit the MySQL shell at any point, type 'quit'.


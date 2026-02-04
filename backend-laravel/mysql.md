
### veritabani

orhan@orhan-TravelMate-P2510-M:~/Documents/quikecommerce/backend-laravel$ set +H
orhan@orhan-TravelMate-P2510-M:~/Documents/quikecommerce/backend-laravel$ sudo mysql -e "DROP USER IF EXISTS 'qe'@'localhost';"
sudo mysql -e "CREATE USER 'qe'@'localhost' IDENTIFIED BY 'StrongPass123!';"
sudo mysql -e "GRANT ALL PRIVILEGES ON quick_ecommerce.* TO 'qe'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
orhan@orhan-TravelMate-P2510-M:~/Documents/quikecommerce/backend-laravel$ sudo mysql -e "SELECT user, host FROM mysql.user WHERE user='qe';"
+------+-----------+
| User | Host      |
+------+-----------+
| qe   | localhost |
+------+-----------+

+-----------------+
| DATABASE()      |
+-----------------+
| quick_ecommerce

orhan@orhan-TravelMate-P2510-M:~/Documents/quikecommerce/backend-laravel$ 

Installer ekranında ne yazacaksın?

Host: 127.0.0.1

DB: quick_ecommerce

User: qe

Pass: StrongPass123!
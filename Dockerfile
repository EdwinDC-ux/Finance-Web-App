FROM php:8.2-apache

# Instalamos extensiones y git/unzip (necesarios para Composer)
RUN apt-get update && apt-get install -y git unzip
RUN docker-php-ext-install pdo pdo_mysql mysqli
RUN a2enmod rewrite

# Instalamos Composer copiándolo de su imagen oficial
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Cambiamos el DocumentRoot a /public
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
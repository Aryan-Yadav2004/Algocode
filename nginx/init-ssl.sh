#!/bin/bash
# init-ssl.sh — Automated SSL Setup using Certbot + Nginx
# Usage: ./init-ssl.sh yourdomain.com your-email@example.com

DOMAIN=$1
EMAIL=$2

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Usage: ./init-ssl.sh <domain> <email>"
    echo "Example: ./init-ssl.sh algocode.com admin@algocode.com"
    exit 1
fi

echo "==> 1. Setting up HTTP-only Nginx configuration for ACME challenge..."
cp nginx/nginx-http.conf nginx/default.conf
docker compose -f docker-compose.prod.yml restart nginx

echo "==> 2. Requesting Let's Encrypt SSL certificate for $DOMAIN..."
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN"

if [ $? -eq 0 ]; then
    echo "==> 3. Certificate obtained successfully! Activating HTTPS Nginx config..."
    export DOMAIN_NAME=$DOMAIN
    envsubst '$DOMAIN_NAME' < nginx/nginx.conf.template > nginx/default.conf
    docker compose -f docker-compose.prod.yml restart nginx
    echo "==> 4. SUCCESS! https://$DOMAIN is now live with SSL!"
else
    echo "==> Certificate generation failed. Check your DNS records (A record pointing to EC2 IP)."
fi

#!/bin/bash

#INSTALL REDIS
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install -y redis-server
sudo sed -i 's/appendonly no/appendonly yes/g' /etc/redis/redis.conf
sudo systemctl restart redis-server.service
sudo systemctl enable redis-server.service

#INSTALL NODEJS
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt install nodejs
npm install pm2 -g

#DOWNLOAD SOURCES
git clone https://github.com/turinglabsorg/micro-explorer
mv micro-explorer/dist lyra/explorer
rm -rf micro-explorer

echo "PORT=3001
COIN=LYRA
RPCUSER=lyrarpc
RPCPASSWORD=5pt4swaNHtzqkGvchxXRZdmuSBhZdsiqULSaB9WwHWEm
RPCPORT=42223
RPCADDRESS=localhost
DEBUG=true
MODE=selective
PERMISSIONS=private" > explorer/.env

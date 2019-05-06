#!/bin/bash

#INSTALL REDIS
sudo apt-get update -y
sudo apt-get install -y redis-server
sudo sed -i 's/appendonly no/appendonly yes/g' /etc/redis/redis.conf
sudo systemctl restart redis-server.service
sudo systemctl enable redis-server.service

#INSTALL NODEJS
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install pm2 -g

#DOWNLOAD SOURCES
git clone https://github.com/turinglabsorg/micro-explorer
mv micro-explorer lyra/explorer

echo "PORT=3001
COIN=LYRA
RPCUSER=lyrarpc
RPCPASSWORD=5pt4swaNHtzqkGvchxXRZdmuSBhZdsiqULSaB9WwHWEm
RPCPORT=42223
RPCADDRESS=localhost
DEBUG=true
MODE=selective
PERMISSIONS=private" > explorer/.env

cd lyra/explorer
npm install
npm run tsc
cd dist
pm2 start index.js
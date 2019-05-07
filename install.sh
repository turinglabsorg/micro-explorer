#!/bin/bash
if [ $1 -a $2 -a $3 -a $4 ]; then
    echo "STARTING INSTALL FOR $1"
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
    touch explorer/dist/.env

    echo "PORT=3001
    COIN=$1
    RPCUSER=$2
    RPCPASSWORD=$3
    RPCPORT=$4
    RPCADDRESS=localhost
    DEBUG=true
    MODE=selective
    PERMISSIONS=private" > explorer/dist/.env

    cd lyra/explorer
    npm install
    npm run tsc
    cd dist
    pm2 start index.js
else
    echo "ARGUMENTS NEEDED: coin rpcuser rpcpassword rpcport"
fi
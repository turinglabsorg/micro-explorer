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
    mv micro-explorer $1/explorer
    touch $1/explorer/dist/.env

    echo "COIN=$1\nRPCUSER=$2\nRPCPASSWORD=$3\nRPCPORT=$4\nRPCADDRESS=localhost\nDEBUG=true\nMODE=selective\nPERMISSIONS=private" > $1/explorer/dist/.env

    cd $1/explorer
    npm install
    npm run tsc
    cd dist
    pm2 start index.js --watch --name $1-explorer
else
    echo "ARGUMENTS NEEDED: coinfolder rpcuser rpcpassword rpcport"
fi
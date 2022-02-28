#!/bin/bash
yum update -y
sudo su

wget https://download.java.net/java/GA/jdk17/0d483333a00540d886896bac774ff48b/35/GPL/openjdk-17_linux-x64_bin.tar.gz
tar xvf openjdk-17_linux-x64_bin.tar.gz
sudo mv jdk-17 /opt/

sudo tee /etc/profile.d/jdk.sh <<EOF
export JAVA_HOME=/opt/jdk-17
export PATH=\$PATH:\$JAVA_HOME/bin
EOF

source /etc/profile.d/jdk.sh

sudo adduser minecraft

sudo su
mkdir /opt/minecraft/
mkdir /opt/minecraft/server/
cd /opt/minecraft/server

usermod -d /opt/minecraft minecraft

wget https://launcher.mojang.com/v1/objects/125e5adf40c659fd3bce3e66e67a16bb49ecc1b9/server.jar

sudo chown -R minecraft:minecraft /opt/minecraft/
sudo chown -R minecraft:minecraft /opt/minecraft/server

echo 'eula=true' >> eula.txt

sudo aws s3 cp s3://senate-minecraft-bundle-walls/minecraft.service /etc/systemd/system/minecraft.service
sudo aws s3 cp s3://senate-minecraft-bundle-walls/server.properties /opt/minecraft/server/server.properties

sudo systemctl daemon-reload
sudo systemctl enable minecraft
sudo systemctl start minecraft

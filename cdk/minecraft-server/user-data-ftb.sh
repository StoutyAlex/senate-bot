#!/bin/bash
yum update -y
sudo su

wget https://download.java.net/java/GA/jdk15.0.2/0d1cfde4252546c6931946de8db48ee2/7/GPL/openjdk-15.0.2_linux-x64_bin.tar.gz
tar xvf openjdk-15.0.2_linux-x64_bin.tar.gz
sudo mv jdk-15.0.2 /opt/

sudo tee /etc/profile.d/jdk.sh <<EOF
export JAVA_HOME=/opt/jdk-15.0.2
export PATH=\$PATH:\$JAVA_HOME/bin
EOF

source /etc/profile.d/jdk.sh

sudo adduser minecraft

sudo su
mkdir /opt/minecraft/
mkdir /opt/minecraft/server/
cd /opt/minecraft/server

usermod -d /opt/minecraft minecraft

wget https://api.modpacks.ch/public/modpack/93/2109/server/linux

sudo chown -R minecraft:minecraft /opt/minecraft/
sudo chown -R minecraft:minecraft /opt/minecraft/server

chmod u+x ./linux

./linux 93 --auto

sudo chown -R minecraft:minecraft /opt/minecraft/
sudo chown -R minecraft:minecraft /opt/minecraft/server

rm -rf ./eula.txt
echo 'eula=true' >> eula.txt

sudo aws s3 cp s3://senate-minecraft-bundle-ftb/minecraft.service /etc/systemd/system/minecraft.service
sudo aws s3 cp s3://senate-minecraft-bundle-ftb/server.properties /opt/minecraft/server/server.properties

sudo systemctl daemon-reload
sudo systemctl enable minecraft
sudo systemctl start minecraft
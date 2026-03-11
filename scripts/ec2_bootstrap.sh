#!/bin/bash
# Bootstrap script cho EC2 Amazon Linux 2023
# Chạy 1 lần sau khi launch EC2
set -e

echo "======================================"
echo "  AiOps EC2 Bootstrap — Amazon Linux"
echo "======================================"

# Detect package manager
if command -v dnf &> /dev/null; then
    PKG_MGR="dnf"
else
    PKG_MGR="yum"
fi

echo "--- [1/4] Cập nhật hệ thống ---"
sudo $PKG_MGR update -y

echo "--- [2/4] Cài các gói cần thiết ---"
sudo $PKG_MGR install -y nginx ruby wget

echo "--- [3/4] Cài CodeDeploy Agent ---"
REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)
echo "Detected region: $REGION"

cd /home/ec2-user
wget -q "https://aws-codedeploy-${REGION}.s3.${REGION}.amazonaws.com/latest/install"
chmod +x ./install
sudo ./install auto
sudo systemctl start codedeploy-agent
sudo systemctl enable codedeploy-agent

echo "CodeDeploy Agent status:"
sudo systemctl status codedeploy-agent --no-pager

echo "--- [4/4] Chuẩn bị thư mục ---"
sudo mkdir -p /var/www/aiops
sudo chown -R ec2-user:ec2-user /var/www/aiops

echo ""
echo "======================================"
echo "  Bootstrap hoàn thành!"
echo "  CodeDeploy Agent: RUNNING"
echo "  Webroot: /var/www/aiops"
echo "======================================"

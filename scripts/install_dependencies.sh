#!/bin/bash
set -e

echo "=== [BeforeInstall] Checking/Installing Nginx ==="

# Amazon Linux 2023 dùng dnf
if command -v dnf &> /dev/null; then
    PKG_MGR="dnf"
elif command -v yum &> /dev/null; then
    PKG_MGR="yum"
else
    echo "ERROR: Không tìm thấy package manager (dnf/yum)"
    exit 1
fi

# Cài Nginx nếu chưa có
if ! command -v nginx &> /dev/null; then
    echo "Nginx chưa được cài, đang cài bằng $PKG_MGR..."
    sudo $PKG_MGR install -y nginx
else
    echo "Nginx đã được cài: $(nginx -v 2>&1)"
fi

# Enable Nginx khởi động cùng hệ thống
sudo systemctl enable nginx

# Tạo thư mục webroot nếu chưa có
sudo mkdir -p /var/www/aiops
sudo chown -R ec2-user:ec2-user /var/www/aiops

echo "=== [BeforeInstall] Hoàn thành ==="

#!/bin/bash
set -e

echo "=== [ApplicationStart] Khởi động Nginx ==="

# Đảm bảo quyền đúng cho webroot
sudo chown -R nginx:nginx /var/www/aiops 2>/dev/null || \
    sudo chown -R ec2-user:ec2-user /var/www/aiops

# Kiểm tra Nginx config
sudo nginx -t

# Reload nếu đang chạy, start nếu chưa
if systemctl is-active --quiet nginx; then
    sudo systemctl reload nginx
    echo "Nginx đã được reload."
else
    sudo systemctl start nginx
    echo "Nginx đã được start."
fi

echo "=== [ApplicationStart] Hoàn thành ==="

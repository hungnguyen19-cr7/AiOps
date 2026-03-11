#!/bin/bash
set -e

echo "=== [ApplicationStop] Dừng Nginx ==="

if systemctl is-active --quiet nginx; then
    sudo systemctl stop nginx
    echo "Nginx đã dừng."
else
    echo "Nginx chưa chạy, bỏ qua."
fi

echo "=== [ApplicationStop] Hoàn thành ==="

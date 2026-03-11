#!/bin/bash
set -e

echo "=== [ValidateService] Kiểm tra dịch vụ ==="

MAX_RETRIES=6
RETRY_INTERVAL=5
SUCCESS=false

for i in $(seq 1 $MAX_RETRIES); do
    echo "Lần thử $i/$MAX_RETRIES..."
    if curl -f -s -o /dev/null -w "%{http_code}" http://localhost:80 | grep -qE "^2[0-9][0-9]$"; then
        echo "✅ Dịch vụ hoạt động bình thường (HTTP 2xx)"
        SUCCESS=true
        break
    fi
    echo "Chưa phản hồi, đợi ${RETRY_INTERVAL}s..."
    sleep $RETRY_INTERVAL
done

if [ "$SUCCESS" != "true" ]; then
    echo "❌ Dịch vụ không phản hồi sau $MAX_RETRIES lần thử"
    sudo systemctl status nginx || true
    exit 1
fi

echo "=== [ValidateService] Hoàn thành ==="

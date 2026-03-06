#!/bin/bash
set -euo pipefail

echo "╔════════════════════════════════════════╗"
echo "║     Starting Blue-Green Deployment     ║"
echo "╚════════════════════════════════════════╝"
echo ""

# ==============================
# CONFIGURATION
# ==============================

BASE_DIR="/home/nexoristech25"
BLUE_DIR="$BASE_DIR/nest-blue"
GREEN_DIR="$BASE_DIR/nest-green"
NGINX_CONFIG="/etc/nginx/sites-available/nest_app"

# ==============================
# DETERMINE ACTIVE VERSION
# ==============================

if grep -q "127.0.0.1:3001;" "$NGINX_CONFIG"; then
  NEW_PORT=3002
  OLD_PORT=3001
  NEW_DIR="$GREEN_DIR"
  OLD_DIR="$BLUE_DIR"
  echo "🔵 Blue active → deploying Green (3002)"
else
  NEW_PORT=3001
  OLD_PORT=3002
  NEW_DIR="$BLUE_DIR"
  OLD_DIR="$GREEN_DIR"
  echo "🟢 Green active → deploying Blue (3001)"
fi

# ==============================
# CLONE OR UPDATE
# ==============================

if [ ! -d "$NEW_DIR/.git" ]; then
  echo "📦 Cloning repository..."
  git clone git@github.com:Nexoris25/GLEEN-Backend.git "$NEW_DIR"
else
  echo "🔄 Updating repository..."
  cd "$NEW_DIR"
  git fetch origin
  git reset --hard origin/main
fi

cd "$NEW_DIR"

# ==============================
# INSTALL + BUILD
# ==============================

echo "📦 Installing dependencies..."
npm ci

echo "⚙️ Building application..."
npm run build

# ==============================
# START NEW VERSION
# ==============================

echo "🚀 Starting app on port $NEW_PORT..."
nohup env PORT=$NEW_PORT npm run start:prod \
  > "$BASE_DIR/nest_$NEW_PORT.log" 2>&1 &

# ==============================
# HEALTH CHECK
# ==============================

echo "🧪 Health checking..."
for i in {1..10}; do
  if nc -z localhost "$NEW_PORT"; then
    echo "✅ Port $NEW_PORT is running"
    break
  fi
  sleep 2
done

# ==============================
# SWITCH NGINX
# ==============================

echo "🔄 Switching Nginx..."

sudo sed -i \
  -e "s/127.0.0.1:$OLD_PORT;/127.0.0.1:$NEW_PORT;/" \
  "$NGINX_CONFIG"

sudo nginx -t && sudo systemctl reload nginx

# ==============================
# STOP OLD VERSION
# ==============================

echo "♻️ Stopping old app..."
PID=$(lsof -t -i :"$OLD_PORT" || true)

if [ -n "${PID:-}" ]; then
  kill -9 $PID
fi

# ==============================
# DONE
# ==============================

echo "🎉 Deployment successful!"
exit 0
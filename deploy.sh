#!/bin/bash
set -euo pipefail

echo "╔════════════════════════════════════════╗"
echo "║     Starting Blue-Green Deployment     ║"
echo "╚════════════════════════════════════════╝"
echo ""

# CONFIGURATION
BASE_DEPLOY_DIR="/srv"
BLUE_DIR="$BASE_DEPLOY_DIR/nest-blue"
GREEN_DIR="$BASE_DEPLOY_DIR/nest-green"
NGINX_CONFIG="/etc/nginx/sites-available/nest_app"
NODE_BIN="/usr/bin/node"
PM2_BIN="/usr/local/bin/pm2"

# Determine active deployment
if grep -q "127.0.0.1:3001;" "$NGINX_CONFIG"; then
  NEW_PORT=3002
  OLD_PORT=3001
  NEW_COLOR=green
  OLD_COLOR=blue
  NEW_DIR="$GREEN_DIR"
  OLD_DIR="$BLUE_DIR"
  echo "🔵 Blue is active (3001), deploying green (3002)..."
else
  NEW_PORT=3001
  OLD_PORT=3002
  NEW_COLOR=blue
  OLD_COLOR=green
  NEW_DIR="$BLUE_DIR"
  OLD_DIR="$GREEN_DIR"
  echo "🟢 Green is active (3002), deploying blue (3001)..."
fi

# Prepare the new directory
if [ ! -d "$NEW_DIR/.git" ]; then
  echo "📦 Cloning repo into $NEW_DIR..."
  git clone "https://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@github.com/Nexoris25/GLEEN-Backend.git" "$NEW_DIR"
else
  echo "🔄 Updating repo in $NEW_DIR..."
  cd "$NEW_DIR"
  git fetch origin
  git reset --hard origin/main
  git pull origin main
fi

cd "$NEW_DIR"

# Load environment variables
ENV_FILE="$NEW_DIR/.env"
if [ -f "$ENV_FILE" ]; then
  echo "📄 Loading .env variables..."
  set -a
  . "$ENV_FILE"
  set +a
fi

echo "📦 Installing dependencies..."
npm install

# Check if migrations run successfully
echo "⚙️ Updating Migration..."
if npm run migrate:up; then
  echo "✅ Database migration successful."
else
  echo "❌ CRITICAL ERROR: Database migration failed. The deployment cannot continue."
  echo "Please check the migration files and the database connection."
  exit 1 # Exit with a failure code
fi

# echo "seeding the db...."
# npm run db:seed:all

echo "⚙️ Building NestJS app..."
npm run build

# Kill any old process on NEW_PORT
echo "🛑 Stopping previous $NEW_COLOR app on port $NEW_PORT (if any)..."
pkill -f "node.*$NEW_PORT" || true

echo "🚀 Starting $NEW_COLOR app on port $NEW_PORT..."
nohup env PORT=$NEW_PORT npm run start:prod > "$NEW_DIR/nest_$NEW_COLOR.log" 2>&1 &

# Health check loop
echo "🧪 Running health check..."
for i in {1..10}; do
  if nc -z localhost "$NEW_PORT"; then
    echo "✅ TCP port $NEW_PORT is open"
    break
  else
    echo "⏳ Waiting for port $NEW_PORT... ($i/10)"
    sleep 2
  fi
done

# Check if health check failed and exit if so
if [ ! $i -lt 10 ]; then
  echo "❌ Health check failed after multiple attempts. The new app is not running."
  echo "Rolling back deployment..."
  # Clean up the new failed app
  PID=$(lsof -t -i :"$NEW_PORT")
  if [ -n "$PID" ]; then
    kill -9 $PID
  fi
  exit 1
fi

# Switch Nginx
echo "🔄 Switching Nginx to $NEW_COLOR on port $NEW_PORT..."
sudo sed -i \
  -e "s/127.0.0.1:$OLD_PORT;/127.0.0.1:$NEW_PORT;/" \
  -e "s/127.0.0.1:$NEW_PORT backup;/127.0.0.1:$OLD_PORT backup;/" \
  "$NGINX_CONFIG"

sudo nginx -t && sudo systemctl reload nginx || {
  echo "❌ Nginx reload failed. Rolling back..."
  sudo sed -i \
    -e "s/127.0.0.1:$NEW_PORT;/127.0.0.1:$OLD_PORT;/" \
    -e "s/127.0.0.1:$OLD_PORT backup;/127.0.0.1:$NEW_PORT backup;/" \
    "$NGINX_CONFIG"
  sudo nginx -t && sudo systemctl reload nginx
  exit 1
}

# Stop old app
echo "♻️ Stopping old $OLD_COLOR app on port $OLD_PORT..."
PID=$(lsof -t -i :"$OLD_PORT")
if [ -n "$PID" ]; then
  echo "Killing process on port $OLD_PORT with PID $PID"
  kill -9 $PID
else
  echo "No process found on port $OLD_PORT"
fi

# Update symlink
SYMLINK_PATH="/srv/nest-current"
echo "🔗 Updating current symlink..."
rm -f "$SYMLINK_PATH"
ln -s "$NEW_DIR" "$SYMLINK_PATH"

echo "🎉 Deployment successful! $NEW_COLOR app now active on port $NEW_PORT"
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║        NestJS Deployment Completed.          ║"
echo "╚══════════════════════════════════════════════╝"
exit 0
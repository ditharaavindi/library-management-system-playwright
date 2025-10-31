#!/bin/bash

# Library Management System Startup Script
# This script starts both backend and frontend servers and opens the browser

echo "🚀 Starting Library Management System..."
echo ""

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    # Kill all npm processes and their children
    pkill -f "npm run dev" 2>/dev/null
    pkill -f "next dev" 2>/dev/null
    pkill -f "ts-node-dev" 2>/dev/null
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Kill any existing processes on our ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
sleep 1

# Create logs directory up-front so redirection works
mkdir -p logs

# Start backend server
echo "🔧 Starting backend server on port 5001..."
cd backend
PORT=5001 npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🎨 Starting frontend server on port 3000..."
cd frontend
PORT=3000 npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Create logs directory if it doesn't exist
mkdir -p logs

# Wait for servers to be ready
echo "⏳ Waiting for servers to be ready..."
for i in {1..15}; do
    if curl -s http://localhost:5001/health >/dev/null 2>&1 && curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo "✅ Both servers are running successfully!"
        break
    fi
    echo "   Checking servers... ($i/15)"
    sleep 2
done

# Check if servers are actually running
if curl -s http://localhost:5001/health >/dev/null 2>&1 && curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo ""
    echo "📚 Library Management System is ready!"
    echo "🔗 Frontend: http://localhost:3000"
    echo "⚙️  Backend API: http://localhost:5001"
    echo ""
    
    # Open browser automatically
    echo "🌐 Opening browser..."
    sleep 2
    if command -v open >/dev/null 2>&1; then
        # macOS
        open http://localhost:3000
    elif command -v xdg-open >/dev/null 2>&1; then
        # Linux
        xdg-open http://localhost:3000
    elif command -v start >/dev/null 2>&1; then
        # Windows (Git Bash)
        start http://localhost:3000
    else
        echo "Please manually open: http://localhost:3000"
    fi
    
    echo ""
    echo "🔐 Demo Credentials:"
    echo "   👑 Admin: admin@library.com / admin123"
    echo "   📋 Librarian: librarian@library.com / librarian123"
    echo "   👤 User: user@library.com / user123"
    echo ""
    echo "📝 Logs are saved in:"
    echo "   Backend: logs/backend.log"
    echo "   Frontend: logs/frontend.log"
    echo ""
    echo "Press Ctrl+C to stop all servers..."
    
    # Wait for both processes to finish
    wait $BACKEND_PID $FRONTEND_PID
else
    echo "❌ Failed to start servers. Check logs in logs/ directory"
    echo "Backend log:"
    tail -n 10 logs/backend.log 2>/dev/null || echo "No backend log found"
    echo ""
    echo "Frontend log:"
    tail -n 10 logs/frontend.log 2>/dev/null || echo "No frontend log found"
    exit 1
fi
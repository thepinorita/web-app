#!/bin/bash
set -e
echo "Starting Server..."
cd /home/fire/Desktop/programming/web_app/server
npm run dev & 
SERVER_PID=$!
echo "Starting Client..."
cd /home/fire/Desktop/programming/web_app/client
npm run dev & 
CLIENT_PID=$!
echo "👉 Frontend should be available at http://localhost:5173"
trap "kill $SERVER_PID $CLIENT_PID; echo -e '\n Stopped all services.'; exit" SIGINT
wait

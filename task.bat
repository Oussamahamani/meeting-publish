@echo off

REM Step 1: Start the Node.js server
start node index.js

REM Wait for the server to start (you might need to adjust the delay)
timeout /nobreak /t 5

REM Step 2: Make a request to the server
REM You can replace "http://localhost:3000" with the appropriate URL
curl http://localhost:5454/canvas

REM Step 3: Kill the Node.js server
taskkill /F /IM node.exe
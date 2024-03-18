#!/bin/bash

# Step 1: Start the Node.js server
node index.js &

# Save the process ID (PID) of the Node.js server
SERVER_PID=$!

# Step 2: Make a request to the server
# You can replace "http://localhost:3000" with the appropriate URL
curl http://localhost:5454/canvas

# Step 3: Kill the Node.js server
kill $SERVER_PID

const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const port = 3000;

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

#!/usr/bin/env node
const express = require("express");
const opn = require("opn");
const path = require("path");

const app = express();
const port = 5649;

app.get("/", (req, res) => {
  // res.sendFile(__dirname + "/index.html");
  res.send(html);
});

// Serve static files from the 'public' folder
app.use("/public", express.static(path.join(__dirname, "public")));

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log("Opening logscren on http://localhost:" + port);
  console.log(
    "Loving logscreen? Consider supporting the project by sponsoring on GitHub: https://github.com/sponsors/soorajshankar"
  );

  opn("http://localhost:" + port); // Open the browser
});

// Set up Socket.io for real-time communication
const io = require("socket.io")(server);

// Socket.io connection event
io.on("connection", (socket) => {
  // console.log("::Browser connected");

  // Send the real-time input to the connected client
  process.stdin.on("data", (chunk) => {
    // console.log('Received data:___')
    const logLine = chunk.toString();
    const timestampedLog = `${new Date().toISOString()} :: ${logLine}`;
    socket.emit("input", timestampedLog);
  });
});

// Pass the io object to the index.html file
app.use((req, res, next) => {
  res.locals.io = io;
  next();
});

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Real-time Input with React</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <style>
    .json-container[hidden] {
      display: none;
    }

    .json-container button {
      display: block;
      margin-bottom: 8px;
    }
  </style>
</head>
<body class="font-sans bg-gray-100 p-6">

  <div id="root"></div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.1/socket.io.js"></script>
  <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/babel-standalone@6.26.0/babel.min.js"></script>
  <!-- Load uuid library from CDN -->
  <script src="https://cdn.jsdelivr.net/npm/uuid@8.3.2/dist/umd/uuidv4.min.js"></script>
  
  <script type="text/babel" src="public/app.jsx"></script>
</body>
</html>
`;

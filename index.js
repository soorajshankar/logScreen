#!/usr/bin/env node
const express = require("express");
const opn = require("opn");

const app = express();
const port = 5649;

app.get("/", (req, res) => {
  // res.sendFile(__dirname + "/index.html");
  res.send(html);
});

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  opn("http://localhost:" + port); // Open the browser
});

// Set up Socket.io for real-time communication
const io = require("socket.io")(server);

// Socket.io connection event
io.on("connection", (socket) => {
  console.log("A user connected");

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

  <script type="text/babel">
    const { useState, useEffect } = React;

    function App() {
      const [logs, setLogs] = useState([]);

      useEffect(() => {
        const socket = io();

        function parseAndRenderLog(data) {
          const [timestamp, logline] = data.split(" :: ");

          try {
            const parsedJSON = JSON.parse(logline);
            setLogs(prevLogs => [...prevLogs, { timestamp, content: parsedJSON }]);
          } catch (error) {
            setLogs(prevLogs => [...prevLogs, { timestamp, content: logline }]);
          }
        }

        socket.on("input", parseAndRenderLog);

        return () => {
          // Clean up the socket connection on component unmount
          socket.off("input", parseAndRenderLog);
        };
      }, []); // Empty dependency array ensures the effect runs once on mount

      return (
        <div>
          <h1 className="text-3xl mb-6">Real-time Input with React</h1>
          <ul className="list-none p-0">
            {logs.map((log, index) => (
              <li key={index} className="bg-white shadow-md rounded-md p-4 mb-4">
                <div className="text-sm text-gray-500">{log.timestamp}</div>
                {typeof log.content === 'object' ? (
                  <div className="json-container">
                    <button onClick={() => alert('Expand button clicked')}>Expand</button>
                    <pre>{JSON.stringify(log.content, null, 2)}</pre>
                  </div>
                ) : (
                  <div className="text-lg">{log.content}</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    ReactDOM.render(<App />, document.getElementById('root'));
  </script>
</body>
</html>
`;

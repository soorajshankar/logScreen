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
    const { useState, useEffect, useMemo } = React;
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false };
      }
    
      static getDerivedStateFromError(error) {
        return { hasError: true };
      }
    
      componentDidCatch(error, errorInfo) {
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
        console.log('props:', this.props);
      }
    
      render() {
        if (this.state.hasError) {
          return (
            <div className="p-4 bg-red-200 text-red-800">
              <p>Something is not right in here.</p>
            </div>
          );
        }
    
        return this.props.children;
      }
    }
    

    const LogViewer = ({ logs }) => {
      const MAX_CHARACTERS = 500; // Maximum characters to display for each log message
    
      const [selectedLog, setSelectedLog] = useState(null);
    
      const truncateMessage = useMemo(() => {
        return (message) => {
          if (typeof message !== 'string') message = JSON.stringify(message, null, 2);
          return message.length > MAX_CHARACTERS
            ? message.slice(0, MAX_CHARACTERS) + '...'
            : message;
        };
      }, [MAX_CHARACTERS]);
    
      const openFullLog = (log) => {
        setSelectedLog(log);
      };
    
      const closeFullLog = () => {
        setSelectedLog(null);
      };
    
      return (
        <div className="flex flex-col h-screen p-4 bg-gray-100">
          {logs.toReversed().map((log, index) => (
            <ErrorBoundary key={index}>
              <div
                className="flex items-start border-b border-gray-300 py-2 hover:bg-blue-100 cursor-pointer transition-all"
                onClick={() => openFullLog(log)}
              >
                <div className="w-1/4 pr-4">
                  <span className="text-gray-500">{log.timestamp}</span>
                </div>
                <div className="w-3/4">
                  <pre className="text-gray-700 whitespace-pre-wrap break-all">
                    {truncateMessage(log.message)}
                  </pre>
                </div>
              </div>
            </ErrorBoundary>
          ))}
    
          {selectedLog && (
            <div className="fixed top-0 right-0 bottom-0 bg-white w-1/2 p-4 overflow-hidden shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Full Log</h2>
                <div>
                  <button className="text-blue-500" onClick={closeFullLog}>
                    Close
                  </button>
                  <button
                    className="bg-blue-500 text-white py-2 px-4 ml-2"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(selectedLog.message, null, 2)).then(function(x) {
                        alert('Copied to clipboard!');
                      })
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="max-h-screen overflow-y-auto bg-gray-800 rounded p-4">
                <pre className="text-white whitespace-pre-wrap break-all">
                  {JSON.stringify(selectedLog.message, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
        </div>
      );
    };

    function App() {
      const [logs, setLogs] = useState([]);

      useEffect(() => {
        const socket = io();

        function parseAndRenderLog(data) {
          const [timestamp, logline] = data.split(" :: ");

          try {
            const parsedJSON = JSON.parse(logline);
            setLogs(prevLogs => [...prevLogs, { timestamp, message: parsedJSON }]);
          } catch (error) {
            setLogs(prevLogs => [...prevLogs, { timestamp, message: logline }]);
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
        <a className="text-3xl mb-6" href="https://github.com/soorajshankar/logScreen" target="_blank" rel="noopener noreferrer">| npx logscreen </a>
        <LogViewer logs={logs} />
        </div>
      );
    }

    ReactDOM.render(<App />, document.getElementById('root'));
  </script>
</body>
</html>
`;

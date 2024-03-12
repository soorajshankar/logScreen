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
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    console.log("props:", this.props);
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

const LogViewer = ({ logs: rawLogs, searchTerm }) => {
  const MAX_CHARACTERS = 500; // Maximum characters to display for each log message

  const [selectedLog, setSelectedLog] = useState(null);
  console.log("rawLogs:", rawLogs);
  const logs = useMemo(() => {
    console.log("searchTerm:", searchTerm);
    if (!searchTerm) return rawLogs;
    if (!rawLogs) return [];
    return (
      rawLogs.filter((log) =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase())
      ) || []
    );
  }, [rawLogs, searchTerm]);

  const truncateMessage = useMemo(() => {
    return (message) => {
      if (typeof message !== "string")
        message = JSON.stringify(message, null, 2);
      return message.length > MAX_CHARACTERS
        ? message.slice(0, MAX_CHARACTERS) + "..."
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
        <ErrorBoundary key={log.key}>
          <div
            className="flex items-start border-b border-gray-300 py-2 hover:bg-blue-100 cursor-pointer transition-all"
            onClick={() => openFullLog(log)}
          >
            <div className="w-1/4 pr-4">
              <span className="text-gray-500">
                {new Date(log.timestamp).toString()}
              </span>
            </div>
            <div className="w-3/4">
              <pre className="text-gray-700 whitespace-pre-wrap break-all">
                <ParsedLog log={truncateMessage(log.message)} />
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
                  navigator.clipboard
                    .writeText(JSON.stringify(selectedLog.message, null, 2))
                    .then(function (x) {
                      alert("Copied to clipboard!");
                    });
                }}
              >
                Copy
              </button>
            </div>
          </div>
          <div className="max-h-screen overflow-y-auto bg-gray-800 rounded p-4">
            <pre className="text-white whitespace-pre-wrap break-all">
              <ParsedLog log={JSON.stringify(selectedLog.message)} />
              {/* {JSON.stringify(selectedLog.message, null, 2)} */}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

const ParsedLog = ({ log }) => {
  const parsedLog = useMemo(() => {
    const ansiRegex = /\u001b\[\d+m/g;
    const cleanedLog = log.replace(ansiRegex, '');

    const regex = /(\w+): (.*)/;
    const match = cleanedLog.match(regex);

    if (!match) {
      return <span>{cleanedLog}</span>;
    }

    const [_, level, message] = match;

    const color = {
      info: 'green',
      error: 'red',
      warning: 'orange',
    }[level.toLowerCase()] || 'black';

    return (
      <span style={{ color: color }}>
        <strong>{level}</strong>: {message}
      </span>
    );
  }, [log]);

  return parsedLog;
};

function App() {
  const [logs, setLogs] = useState([]);
  const [logLevels, setLogLevels] = useState(new Set(['unknown']));
  const [selectedLevel, setSelectedLevel] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [startDateTime, setStartDateTime] = useState('');

  useEffect(() => {
    const socket = io();

    function parseAndRenderLog(data) {
      const [timestamp, ...loglineParts] = data.split(" :: ");
      const logline = loglineParts.join(" :: ");

      const regex = /\b(Error|Warning|Info|Critical|Debug)\s*::?\s*/i;
      const match = logline.match(regex);

      let level = 'unknown'; // Default log level
      if (match) {
        level = match[1].trim().toLowerCase(); // Extract log level
      }

      setLogs((prevLogs) => [
        ...prevLogs,
        { key: uuidv4(), timestamp, message: logline, level },
      ]);

      setLogLevels(prevLevels => new Set([...prevLevels, level]));
    }

    socket.on("input", parseAndRenderLog);

    return () => {
      socket.off("input", parseAndRenderLog);
    };
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const logDateTime = new Date(log.timestamp);
      const filterDateTime = startDateTime ? new Date(startDateTime) : null;
      return (
        (selectedLevel === '' || log.level === selectedLevel) &&
        (searchTerm === '' || log.message.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!filterDateTime || logDateTime >= filterDateTime)
      );
    });
  }, [logs, selectedLevel, searchTerm, startDateTime]);

  return (
    <div>
      <div className="flex items-center justify-between bg-gray-800 p-4 text-white">
        <div
          // vertical div
          className="flex flex-col items-start justify-center"
        >
          <a
            className="text-3xl mb-2"
            href="https://github.com/soorajshankar/logScreen"
            target="_blank"
            rel="noopener noreferrer"
          >
            | npx logscreen{" "}
          </a>
          <a
            className="text-sm"
            href="https://github.com/sponsors/soorajshankar"
            target="_blank"
            rel="noopener noreferrer"
          >
            Suppport this project
          </a>
        </div>
        <input
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 text-gray-800 bg-white rounded w-1/4"
        />
        <div className="filter-select">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="p-2 border border-gray-300 text-gray-800 bg-white rounded"
          >
            <option value="">All Levels</option>
            {Array.from(logLevels).map(level => (
              <option key={level} value={level}>{level.toUpperCase()}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between bg-gray-800 p-4 text-white">
          <input
            type="datetime-local"
            value={startDateTime}
            onChange={(e) => setStartDateTime(e.target.value)}
            className="p-2 border border-gray-300 text-gray-800 bg-white rounded"
          />
        </div>
      </div>
      <LogViewer logs={filteredLogs} searchTerm={searchTerm} />
      </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));

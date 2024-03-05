const logTypes = ['info', 'warning', 'error', 'debug', 'success', 'critical', null];

function getRandomLog() {
  const type = logTypes[Math.floor(Math.random() * logTypes.length)];
  const message = generateLogMessage(type);
  return `${new Date().toISOString()} :: ${message}\n`;
}

function generateLogMessage(type) {
  switch (type) {
    case 'info':
      return 'This is an informative message.';
    case 'warning':
      return 'Warning: Something might need attention.';
    case 'error':
      return 'Error: An unexpected error occurred.';
    case 'debug':
      return 'Debugging information for developers.';
    case 'success':
      return 'Operation completed successfully.';
    case 'critical':
      return 'Critical: This requires immediate attention!';
    default:
      return generateCustomLog();
  }
}

function generateCustomLog() {
  const logFormats = [
    { type: 'json', content: { key: 'value', array: [1, 2, 3] } },
    { type: 'json_string', content: 'This is a JSON string: {"key":"value"}' },
    { type: 'string_json', content: 'This is a string with JSON: ', json: { key: 'value' } },
    { type: 'separator', content: '------------------------' },
    // Add more log formats as needed
  ];

  const logFormat = logFormats[Math.floor(Math.random() * logFormats.length)];

  switch (logFormat.type) {
    case 'json':
      return JSON.stringify(logFormat.content, null, 2);
    case 'json_string':
      return `${logFormat.content}\n`;
    case 'string_json':
      return `${logFormat.content}${JSON.stringify(logFormat.json, null, 2)}\n`;
    case 'separator':
      return `${logFormat.content}\n`;
    default:
      return 'Custom log message.';
  }
}

function emitLogs() {
  setInterval(() => {
    const log = getRandomLog();
    process.stdout.write(log);
  }, 1000);
}

console.log('Log emitter started. Press Ctrl+C to stop.');

emitLogs();

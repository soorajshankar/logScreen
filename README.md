# LogScreen

> Loglines can be messy, read it better on a browser.

## Usage

After installation, you can use LogScreen to view command outputs in a browser:

```bash
command | npx logscreen
```

Replace `command` with the actual command you want to execute. LogScreen will start a local server and open the logs in your default web browser.

Here are some examples:

### Example 1: Viewing Docker Logs

```bash
  docker-compose up | npx logscreen
```

This example pipes the logs from a Docker Compose service into LogScreen, providing a more readable and interactive log view.

### Example 2: Monitoring NPM Start Script

```bash
  npm start | npx logscreen
```

If you have a Node.js project with an \`npm start\` script, you can use LogScreen to monitor and navigate through the logs as your application runs.

### Example 3: Tail Command Output

```bash
  tail -f /var/log/syslog | npx logscreen
```

For Linux users, you can use LogScreen with the \`tail\` command to follow and visualize real-time updates in system logs.

Replace the commands above with your specific use case to leverage the benefits of LogScreen's web-based log viewer.

## Features

- **Web-Based Log Viewer**: Get a cleaner and more organized view of command outputs.
- **Real-Time Updates**: Logs are displayed in real-time as the command executes.
- **Interactive Interface**: Search, filter, and navigate through logs easily. // TODO

## Options

- **Port**: By default, LogScreen uses port 3000. You can specify a different port using the `-p` or `--port` option:

  ```bash
  command | npx logscreen --port 8080
  ```

## Acknowledgments

- [Socket.io](https://socket.io/) for real-time communication.
- [Express](https://expressjs.com/) for the web server.

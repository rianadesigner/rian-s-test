class ProcessManager {
  constructor(name) {
    this.name = name;
    this.state = 'stopped';
  }

  start() {
    if (this.state === 'running') {
      return `${this.name} is already running.`;
    }

    this.state = 'running';
    return `${this.name} started.`;
  }

  stop() {
    if (this.state === 'stopped') {
      return `${this.name} is already stopped.`;
    }

    this.state = 'stopped';
    return `${this.name} stopped.`;
  }

  restart() {
    const stopped = this.stop();
    const started = this.start();
    return `${stopped} ${started}`;
  }

  isRunning() {
    return this.state === 'running';
  }
}

module.exports = ProcessManager;

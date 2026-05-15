import { Platform } from 'react-native';

class SimpleLogger {
  private logs: any[] = [];

  log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data: data ? JSON.stringify(data) : null,
      platform: Platform.OS
    };

    this.logs.push(logEntry);
    console.log(`[${level.toUpperCase()}] ${message}`, data);
    
    // Keep only last 50 logs to prevent memory issues
    if (this.logs.length > 50) {
      this.logs.splice(0, this.logs.length - 50);
    }
  }

  getLogs(): any[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new SimpleLogger();
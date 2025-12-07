/**
 * Logging Utility
 *
 * 환경에 따라 다른 로그 레벨을 제공하는 로거
 * - Development: 모든 로그 출력
 * - Production: 에러만 출력
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  level: LogLevel;
  enableTimestamp: boolean;
  enableColors: boolean;
}

class Logger {
  private config: LoggerConfig;
  private readonly levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

  constructor(config?: Partial<LoggerConfig>) {
    const isDev = import.meta.env.MODE === 'development';
    this.config = {
      level: isDev ? 'debug' : 'error',
      enableTimestamp: true,
      enableColors: isDev,
      ...config,
    };
  }

  /**
   * 디버그 레벨 로그 (개발 환경에서만 출력)
   * @param message - 로그 메시지
   * @param args - 추가 인자
   */
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(this.format('DEBUG', message), ...args);
    }
  }

  /**
   * 정보 레벨 로그
   * @param message - 로그 메시지
   * @param args - 추가 인자
   */
  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(this.format('INFO', message), ...args);
    }
  }

  /**
   * 경고 레벨 로그
   * @param message - 로그 메시지
   * @param args - 추가 인자
   */
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.format('WARN', message), ...args);
    }
  }

  /**
   * 에러 레벨 로그 (항상 출력)
   * @param message - 로그 메시지
   * @param args - 추가 인자
   */
  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(this.format('ERROR', message), ...args);
    }
  }

  /**
   * 현재 레벨에서 로그를 출력할지 결정
   */
  private shouldLog(level: LogLevel): boolean {
    return this.levels.indexOf(level) >= this.levels.indexOf(this.config.level);
  }

  /**
   * 로그 메시지 포맷팅
   */
  private format(level: string, message: string): string {
    const timestamp = this.config.enableTimestamp
      ? `[${new Date().toISOString()}]`
      : '';

    if (this.config.enableColors) {
      return `${timestamp} ${this.colorize(level, `[${level}]`)} ${message}`;
    }

    return `${timestamp} [${level}] ${message}`;
  }

  /**
   * ANSI 색상 코드 적용
   */
  private colorize(level: string, text: string): string {
    const colors = {
      DEBUG: '\x1b[36m',  // Cyan
      INFO: '\x1b[32m',   // Green
      WARN: '\x1b[33m',   // Yellow
      ERROR: '\x1b[31m',  // Red
      RESET: '\x1b[0m',
    };

    const color = colors[level as keyof typeof colors] || colors.RESET;
    return `${color}${text}${colors.RESET}`;
  }

  /**
   * 로그 레벨 변경
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * 현재 로그 레벨 반환
   */
  getLevel(): LogLevel {
    return this.config.level;
  }
}

/**
 * 기본 로거 인스턴스
 */
export const logger = new Logger();

/**
 * 커스텀 로거 생성
 */
export function createLogger(config?: Partial<LoggerConfig>): Logger {
  return new Logger(config);
}

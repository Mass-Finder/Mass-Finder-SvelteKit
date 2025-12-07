/**
 * Storage Service
 *
 * localStorage를 안전하게 사용하기 위한 래퍼 서비스
 * - SSR 환경 호환성
 * - 데이터 검증
 * - 크기 제한
 * - 에러 처리
 */

import { logger } from '../utils/logger';

/**
 * 저장 옵션
 */
export interface StorageOptions<T = unknown> {
  /**
   * 최대 크기 (MB)
   * @default 5
   */
  maxSizeMB?: number;

  /**
   * 데이터 유효성 검증 함수
   */
  validator?: (data: T) => boolean;

  /**
   * 만료 시간 (밀리초)
   * @default undefined (만료 없음)
   */
  expiresIn?: number;
}

/**
 * 저장된 데이터 래퍼
 */
interface StorageWrapper<T> {
  data: T;
  timestamp: number;
  expiresAt?: number;
}

/**
 * Storage Service 클래스
 */
export class StorageService {
  private readonly isAvailable: boolean;
  private readonly defaultMaxSizeMB = 5;

  constructor() {
    // SSR 환경에서는 localStorage 사용 불가
    this.isAvailable =
      typeof window !== 'undefined' &&
      typeof window.localStorage !== 'undefined';

    if (!this.isAvailable) {
      logger.warn('localStorage is not available (SSR environment)');
    }
  }

  /**
   * 데이터 저장
   *
   * @param key - 저장 키
   * @param data - 저장할 데이터
   * @param options - 저장 옵션
   * @returns 성공 여부
   *
   * @example
   * ```typescript
   * const success = storage.save('userData', { name: 'John' }, {
   *   maxSizeMB: 1,
   *   expiresIn: 1000 * 60 * 60 * 24 // 24시간
   * });
   * ```
   */
  save<T>(key: string, data: T, options?: StorageOptions<T>): boolean {
    if (!this.isAvailable) {
      logger.warn(`Cannot save to localStorage: not available (key: ${key})`);
      return false;
    }

    try {
      // 데이터 래핑
      const wrapper: StorageWrapper<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: options?.expiresIn
          ? Date.now() + options.expiresIn
          : undefined,
      };

      const serialized = JSON.stringify(wrapper);
      const sizeInMB = new Blob([serialized]).size / 1024 / 1024;
      const maxSize = options?.maxSizeMB ?? this.defaultMaxSizeMB;

      // 크기 제한 확인
      if (sizeInMB > maxSize) {
        logger.error(
          `Data too large for key "${key}": ${sizeInMB.toFixed(2)}MB (max: ${maxSize}MB)`
        );
        return false;
      }

      // 검증 함수가 있으면 실행
      if (options?.validator && !options.validator(data)) {
        logger.error(`Validation failed for key "${key}"`);
        return false;
      }

      localStorage.setItem(key, serialized);
      logger.debug(`Saved to localStorage: ${key} (${sizeInMB.toFixed(3)}MB)`);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'QuotaExceededError') {
          logger.error(`Storage quota exceeded for key "${key}"`);
        } else {
          logger.error(`Failed to save to localStorage (${key}):`, error);
        }
      }
      return false;
    }
  }

  /**
   * 데이터 로드
   *
   * @param key - 로드 키
   * @param options - 로드 옵션
   * @returns 저장된 데이터 또는 null
   *
   * @example
   * ```typescript
   * const userData = storage.load<UserData>('userData', {
   *   validator: (data) => typeof data.name === 'string'
   * });
   * ```
   */
  load<T>(key: string, options?: StorageOptions<T>): T | null {
    if (!this.isAvailable) {
      return null;
    }

    try {
      const item = localStorage.getItem(key);
      if (!item) {
        logger.debug(`No data found for key "${key}"`);
        return null;
      }

      const parsed = JSON.parse(item);

      // 하위 호환성: 기존 데이터 형식인지 확인
      // StorageWrapper 형식이 아닌 경우 (data, timestamp 속성이 없는 경우)
      if (!parsed.data && !parsed.timestamp) {
        logger.debug(`Migrating legacy data for key "${key}"`);
        // 기존 형식의 데이터를 그대로 반환하고, 새 형식으로 마이그레이션
        const legacyData = parsed as T;

        // 검증 함수가 있으면 실행
        if (options?.validator && !options.validator(legacyData)) {
          logger.warn(`Validation failed for legacy data key "${key}"`);
          return null;
        }

        // 새 형식으로 자동 마이그레이션
        this.save(key, legacyData);

        return legacyData;
      }

      // 새 형식의 데이터
      const wrapper = parsed as StorageWrapper<T>;

      // 만료 확인
      if (wrapper.expiresAt && Date.now() > wrapper.expiresAt) {
        logger.debug(`Data expired for key "${key}"`);
        this.remove(key);
        return null;
      }

      // 검증 함수가 있으면 실행
      if (options?.validator && !options.validator(wrapper.data)) {
        logger.warn(`Validation failed for key "${key}"`);
        return null;
      }

      logger.debug(`Loaded from localStorage: ${key}`);
      return wrapper.data;
    } catch (error) {
      logger.error(`Failed to load from localStorage (${key}):`, error);
      return null;
    }
  }

  /**
   * 데이터 제거
   *
   * @param key - 제거할 키
   */
  remove(key: string): void {
    if (!this.isAvailable) {
      return;
    }

    try {
      localStorage.removeItem(key);
      logger.debug(`Removed from localStorage: ${key}`);
    } catch (error) {
      logger.error(`Failed to remove from localStorage (${key}):`, error);
    }
  }

  /**
   * 모든 데이터 제거
   */
  clear(): void {
    if (!this.isAvailable) {
      return;
    }

    try {
      localStorage.clear();
      logger.debug('Cleared all localStorage data');
    } catch (error) {
      logger.error('Failed to clear localStorage:', error);
    }
  }

  /**
   * 키 존재 여부 확인
   *
   * @param key - 확인할 키
   * @returns 존재 여부
   */
  has(key: string): boolean {
    if (!this.isAvailable) {
      return false;
    }

    return localStorage.getItem(key) !== null;
  }

  /**
   * 모든 키 목록 반환
   *
   * @returns 키 배열
   */
  keys(): string[] {
    if (!this.isAvailable) {
      return [];
    }

    return Object.keys(localStorage);
  }

  /**
   * 저장된 데이터 크기 계산 (MB)
   *
   * @param key - 키
   * @returns 크기 (MB) 또는 null
   */
  getSize(key: string): number | null {
    if (!this.isAvailable) {
      return null;
    }

    const item = localStorage.getItem(key);
    if (!item) {
      return null;
    }

    return new Blob([item]).size / 1024 / 1024;
  }

  /**
   * 전체 localStorage 사용량 계산 (MB)
   *
   * @returns 사용량 (MB)
   */
  getTotalSize(): number {
    if (!this.isAvailable) {
      return 0;
    }

    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const size = this.getSize(key);
        if (size !== null) {
          total += size;
        }
      }
    }

    return total;
  }

  /**
   * 만료된 데이터 정리
   *
   * @returns 정리된 항목 수
   */
  cleanExpired(): number {
    if (!this.isAvailable) {
      return 0;
    }

    let cleanedCount = 0;
    const now = Date.now();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      try {
        const item = localStorage.getItem(key);
        if (!item) continue;

        const wrapper = JSON.parse(item) as StorageWrapper<unknown>;
        if (wrapper.expiresAt && now > wrapper.expiresAt) {
          this.remove(key);
          cleanedCount++;
        }
      } catch (error) {
        // 파싱 실패한 항목은 무시
        logger.warn(`Failed to parse item for expiration check: ${key}`);
      }
    }

    if (cleanedCount > 0) {
      logger.info(`Cleaned ${cleanedCount} expired items from localStorage`);
    }

    return cleanedCount;
  }
}

/**
 * 기본 Storage Service 인스턴스
 */
export const storage = new StorageService();

/**
 * 특정 키 접두사를 가진 Storage Service 생성
 *
 * @param prefix - 키 접두사
 * @returns Storage Service 래퍼
 *
 * @example
 * ```typescript
 * const userStorage = createPrefixedStorage('user_');
 * userStorage.save('settings', { theme: 'dark' });
 * // 실제 키: 'user_settings'
 * ```
 */
export function createPrefixedStorage(prefix: string) {
  return {
    save: <T>(key: string, data: T, options?: StorageOptions) =>
      storage.save(`${prefix}${key}`, data, options),
    load: <T>(key: string, options?: StorageOptions) =>
      storage.load<T>(`${prefix}${key}`, options),
    remove: (key: string) => storage.remove(`${prefix}${key}`),
    has: (key: string) => storage.has(`${prefix}${key}`),
    getSize: (key: string) => storage.getSize(`${prefix}${key}`),
  };
}

/**
 * 청년센터 API 날짜 파싱 유틸리티 테스트 (TDD RED)
 * Phase 5, T5.1 - 청년센터 API 연동
 */
import { describe, it, expect } from 'vitest';
import { parseDateRange, parseDate } from '@/utils/date-parser';

describe('date-parser', () => {
  describe('parseDate', () => {
    it('should parse standard date format (YYYY.MM.DD)', () => {
      const result = parseDate('2024.01.15');

      const expected = new Date('2024-01-15T00:00:00Z').getTime() / 1000;
      expect(result).toBe(Math.floor(expected));
    });

    it('should parse Korean date format (YYYY년 MM월 DD일)', () => {
      const result = parseDate('2024년 1월 15일');

      const expected = new Date('2024-01-15T00:00:00Z').getTime() / 1000;
      expect(result).toBe(Math.floor(expected));
    });

    it('should parse date with slashes (YYYY/MM/DD)', () => {
      const result = parseDate('2024/01/15');

      const expected = new Date('2024-01-15T00:00:00Z').getTime() / 1000;
      expect(result).toBe(Math.floor(expected));
    });

    it('should parse date with dashes (YYYY-MM-DD)', () => {
      const result = parseDate('2024-01-15');

      const expected = new Date('2024-01-15T00:00:00Z').getTime() / 1000;
      expect(result).toBe(Math.floor(expected));
    });

    it('should return null for invalid date', () => {
      expect(parseDate('invalid')).toBeNull();
      expect(parseDate('')).toBeNull();
      expect(parseDate('상시모집')).toBeNull();
    });

    it('should handle partial dates (year/month only)', () => {
      const result = parseDate('2024년 1월');

      // 월만 있는 경우 해당 월 1일로 파싱
      const expected = new Date('2024-01-01T00:00:00Z').getTime() / 1000;
      expect(result).toBe(Math.floor(expected));
    });
  });

  describe('parseDateRange', () => {
    it('should parse standard range (YYYY.MM.DD~YYYY.MM.DD)', () => {
      const result = parseDateRange('2024.01.01~2024.12.31');

      expect(result.startDate).toBe(Math.floor(new Date('2024-01-01T00:00:00Z').getTime() / 1000));
      expect(result.endDate).toBe(Math.floor(new Date('2024-12-31T00:00:00Z').getTime() / 1000));
      expect(result.isAlwaysOpen).toBe(false);
    });

    it('should parse Korean range (YYYY년 MM월 ~ YYYY년 MM월)', () => {
      const result = parseDateRange('2024년 1월 ~ 2024년 12월');

      expect(result.startDate).toBe(Math.floor(new Date('2024-01-01T00:00:00Z').getTime() / 1000));
      expect(result.endDate).toBe(Math.floor(new Date('2024-12-01T00:00:00Z').getTime() / 1000));
      expect(result.isAlwaysOpen).toBe(false);
    });

    it('should detect always-open status (상시모집)', () => {
      const result = parseDateRange('상시모집');

      expect(result.startDate).toBeNull();
      expect(result.endDate).toBeNull();
      expect(result.isAlwaysOpen).toBe(true);
    });

    it('should detect always-open status (연중상시)', () => {
      const result = parseDateRange('연중상시');

      expect(result.startDate).toBeNull();
      expect(result.endDate).toBeNull();
      expect(result.isAlwaysOpen).toBe(true);
    });

    it('should detect always-open status (수시접수)', () => {
      const result = parseDateRange('수시접수');

      expect(result.startDate).toBeNull();
      expect(result.endDate).toBeNull();
      expect(result.isAlwaysOpen).toBe(true);
    });

    it('should detect always-open status (매월 접수)', () => {
      const result = parseDateRange('매월 접수');

      expect(result.startDate).toBeNull();
      expect(result.endDate).toBeNull();
      expect(result.isAlwaysOpen).toBe(true);
    });

    it('should handle single date (no range)', () => {
      const result = parseDateRange('2024.01.15');

      expect(result.startDate).toBe(Math.floor(new Date('2024-01-15T00:00:00Z').getTime() / 1000));
      expect(result.endDate).toBe(Math.floor(new Date('2024-01-15T00:00:00Z').getTime() / 1000));
      expect(result.isAlwaysOpen).toBe(false);
    });

    it('should handle mixed formats in range', () => {
      const result = parseDateRange('2024.01.01 ~ 2024-12-31');

      expect(result.startDate).toBe(Math.floor(new Date('2024-01-01T00:00:00Z').getTime() / 1000));
      expect(result.endDate).toBe(Math.floor(new Date('2024-12-31T00:00:00Z').getTime() / 1000));
      expect(result.isAlwaysOpen).toBe(false);
    });

    it('should handle empty or invalid range', () => {
      const result = parseDateRange('');

      expect(result.startDate).toBeNull();
      expect(result.endDate).toBeNull();
      expect(result.isAlwaysOpen).toBe(false);
    });

    it('should handle partial range (start date only)', () => {
      const result = parseDateRange('2024.01.01~');

      expect(result.startDate).toBe(Math.floor(new Date('2024-01-01T00:00:00Z').getTime() / 1000));
      expect(result.endDate).toBeNull();
      expect(result.isAlwaysOpen).toBe(false);
    });

    it('should handle text with dates embedded', () => {
      const result = parseDateRange('신청기간: 2024.01.01~2024.12.31 (예산 소진 시 조기 마감)');

      expect(result.startDate).toBe(Math.floor(new Date('2024-01-01T00:00:00Z').getTime() / 1000));
      expect(result.endDate).toBe(Math.floor(new Date('2024-12-31T00:00:00Z').getTime() / 1000));
      expect(result.isAlwaysOpen).toBe(false);
    });
  });
});

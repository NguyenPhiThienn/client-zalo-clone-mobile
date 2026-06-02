// lib/utils.ts — Zalo Clone utilities
import { format } from 'date-fns-tz';
import { formatInTimeZone } from 'date-fns-tz';

const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

/**
 * Parse date từ backend — xử lý 2 format:
 * 1. ISO string: "2026-06-02T08:35:01.123456" (không có timezone → BE trả UTC hoặc local)
 * 2. Jackson array: [2026, 6, 2, 8, 35, 1, 123456789] (LocalDateTime serialized as array)
 * Trả về Date object đúng múi giờ.
 */
export function parseBackendDate(raw: any): Date | null {
  if (!raw) return null;

  // Format array: [year, month (1-indexed), day, hour, minute, second, nano?]
  if (Array.isArray(raw)) {
    const [year, month, day, hour = 0, min = 0, sec = 0] = raw;
    // new Date(year, month-1, ...) → local timezone (Vietnam khi chạy trên thiết bị VN)
    return new Date(year, month - 1, day, hour, min, sec);
  }

  // Format ISO string — thêm 'Z' nếu chưa có timezone suffix để đảm bảo parse đúng UTC
  if (typeof raw === 'string') {
    const hasTimezone = raw.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(raw);
    const iso = hasTimezone ? raw : raw + 'Z';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

/** Format duration in minutes to human-readable string */
export function formatTime(minutes: number): string {
  const formattedMinutes = Math.round(minutes) || 0;
  if (formattedMinutes < 60) return `${formattedMinutes} phút`;
  const hours = Math.floor(formattedMinutes / 60);
  const remainingMinutes = formattedMinutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

/** Format ISO date string to dd/MM/yyyy */
export function formatDateVN(dateString: string): string {
  try {
    return formatInTimeZone(new Date(dateString), VIETNAM_TIMEZONE, 'dd/MM/yyyy');
  } catch {
    return dateString;
  }
}

/** Format ISO date string to dd/MM/yyyy HH:mm */
export function formatDateTimeVN(dateString: string): string {
  try {
    return formatInTimeZone(new Date(dateString), VIETNAM_TIMEZONE, 'dd/MM/yyyy HH:mm');
  } catch {
    return dateString;
  }
}

/** Format ISO date string to HH:mm */
export function formatTimeVN(dateString: string): string {
  try {
    return formatInTimeZone(new Date(dateString), VIETNAM_TIMEZONE, 'HH:mm');
  } catch {
    return '';
  }
}

/** Format message timestamp — show time if today, else show date */
export function formatMessageTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Hôm qua';
  } else {
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  }
}

/** Format full name from firstName + lastName */
export function formatFullName(firstName?: string, lastName?: string): string {
  return `${firstName || ''} ${lastName || ''}`.trim() || 'Người dùng';
}

/** Generate Initials avatar URL from a seed string (handles numbers & text better) */
export function getAvatarUrl(seed: string, fallback?: string | null): string {
  if (fallback) return getImageUrl(fallback) || fallback;
  // Sử dụng UI-Avatars để hỗ trợ tốt nhất cho cả tên bằng số và chữ, đồng bộ màu xanh Zalo
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(seed)}&background=0068ff&color=fff&size=128&bold=true`;
}

const S3_BASE_URL = "https://zaloclone-storage.s3.ap-southeast-1.amazonaws.com";

/** Resolve relative API media paths into full URLs */
export function getImageUrl(path?: string): string | undefined {
  if (!path) return undefined;

  // 1. Nếu đã là URL hoàn chỉnh (Bao gồm Presigned S3, HTTP, hoặc Local Device File URI) thì lấy nguyên bản
  if (path.startsWith('http') || path.startsWith('file://')) return path;

  // 2. Nếu là raw S3 Key (không có dấu /), chúng ta trỏ thẳng về bucket S3 của bạn
  if (!path.includes('/')) {
    return `${S3_BASE_URL}/${path}`;
  }

  // 3. Fallback cho các trường hợp lấy file từ Local API (nếu có)
  const baseUrl = process.env.EXPO_PUBLIC_SERVER_URL || "";
  const host = baseUrl.split('/api/v1')[0];

  if (!host) return undefined;

  const cleanHost = host.endsWith('/') ? host.slice(0, -1) : host;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${cleanHost}${cleanPath}`;
}
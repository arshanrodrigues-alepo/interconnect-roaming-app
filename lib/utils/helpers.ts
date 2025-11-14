import { RoundingRule } from '../types';

/**
 * Format currency with proper decimal places
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date with time
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Apply rounding rule to a value
 */
export function applyRounding(value: number, rule: RoundingRule): number {
  switch (rule) {
    case 'UP':
      return Math.ceil(value);
    case 'DOWN':
      return Math.floor(value);
    case 'NEAREST':
      return Math.round(value);
    default:
      return value;
  }
}

/**
 * Calculate charge for voice calls (in seconds)
 */
export function calculateVoiceCharge(
  durationSeconds: number,
  ratePerSecond: number,
  roundingRule: RoundingRule,
  minimumCharge?: number
): number {
  const charge = durationSeconds * ratePerSecond;
  const finalCharge = minimumCharge ? Math.max(charge, minimumCharge) : charge;
  return Number(finalCharge.toFixed(6));
}

/**
 * Calculate charge for data sessions
 */
export function calculateDataCharge(
  volumeMB: number,
  ratePerMB: number,
  minimumCharge?: number
): number {
  const charge = volumeMB * ratePerMB;
  const finalCharge = minimumCharge ? Math.max(charge, minimumCharge) : charge;
  return Number(finalCharge.toFixed(6));
}

/**
 * Calculate charge for SMS/MMS
 */
export function calculateMessageCharge(
  count: number,
  ratePerMessage: number,
  minimumCharge?: number
): number {
  const charge = count * ratePerMessage;
  const finalCharge = minimumCharge ? Math.max(charge, minimumCharge) : charge;
  return Number(finalCharge.toFixed(6));
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
  const lowerStatus = status.toLowerCase();

  if (lowerStatus.includes('active') || lowerStatus.includes('success') || lowerStatus.includes('paid') || lowerStatus.includes('resolved')) {
    return 'bg-green-100 text-green-800 border-green-300';
  }

  if (lowerStatus.includes('pending') || lowerStatus.includes('scheduled') || lowerStatus.includes('draft')) {
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  }

  if (lowerStatus.includes('suspended') || lowerStatus.includes('disputed') || lowerStatus.includes('investigating')) {
    return 'bg-orange-100 text-orange-800 border-orange-300';
  }

  if (lowerStatus.includes('inactive') || lowerStatus.includes('error') || lowerStatus.includes('failed') || lowerStatus.includes('rejected')) {
    return 'bg-red-100 text-red-800 border-red-300';
  }

  if (lowerStatus.includes('parsing') || lowerStatus.includes('processing') || lowerStatus.includes('in_progress')) {
    return 'bg-blue-100 text-blue-800 border-blue-300';
  }

  return 'bg-gray-100 text-gray-800 border-gray-300';
}

/**
 * Get severity color for anomalies
 */
export function getSeverityColor(severity: string): string {
  switch (severity.toUpperCase()) {
    case 'CRITICAL':
      return 'bg-red-600 text-white';
    case 'HIGH':
      return 'bg-orange-500 text-white';
    case 'MEDIUM':
      return 'bg-yellow-500 text-white';
    case 'LOW':
      return 'bg-blue-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Generate unique ID (simple UUID v4)
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Convert bytes to human readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Alias for formatBytes - format file size to human readable format
 */
export const formatFileSize = formatBytes;

/**
 * Calculate days between dates
 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Check if date is overdue
 */
export function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date();
}

/**
 * Get relative time string
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  if (diffDay < 30) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;

  return formatDate(dateString);
}

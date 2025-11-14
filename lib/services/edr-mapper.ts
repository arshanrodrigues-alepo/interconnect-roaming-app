/**
 * EDR Mapper Service
 *
 * Maps raw TAP records to CDR format for rating engine processing
 */

import { CDR } from '../types';

interface RawRecord {
  [key: string]: any;
}

export interface MappingResult {
  success: boolean;
  cdr?: CDR;
  errors: string[];
}

/**
 * Map raw record to CDR format
 */
export function mapToCDR(
  record: RawRecord,
  partnerId: string,
  direction: 'INCOMING' | 'OUTGOING'
): MappingResult {
  const errors: string[] = [];

  try {
    // Extract and validate required fields
    const calling_number = extractField(record, [
      'calling_number',
      'originating_number',
      'msisdn',
      'a_number',
    ]);
    const called_number = extractField(record, [
      'called_number',
      'destination_number',
      'b_number',
    ]);
    const call_type = extractCallType(record);
    const date_of_event = extractDateField(record, [
      'event_date_time',
      'call_date_time',
      'date_time',
      'timestamp',
    ]);

    // Validate required fields
    if (!calling_number) {
      errors.push('Missing calling_number/originating_number');
    }
    if (!called_number) {
      errors.push('Missing called_number/destination_number');
    }
    if (!call_type) {
      errors.push('Missing or invalid call_type/service_type');
    }
    if (!date_of_event) {
      errors.push('Missing event_date_time/call_date_time');
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    // Build CDR
    const cdr: CDR = {
      calling_number: calling_number!,
      called_number: called_number!,
      call_type: call_type!,
      direction,
      date_of_event: date_of_event!,
      operator_id: partnerId,
      processing_status: 'PENDING',
    };

    // Add optional fields based on call type
    if (call_type === 'VOICE') {
      const duration = extractNumericField(record, [
        'duration',
        'call_duration',
        'duration_seconds',
      ]);
      if (duration !== null) {
        cdr.duration = duration;
      } else {
        errors.push('Missing duration for VOICE call');
        return { success: false, errors };
      }
    } else if (call_type === 'SMS') {
      const number_of_events = extractNumericField(record, [
        'number_of_events',
        'message_count',
        'sms_count',
      ]);
      cdr.number_of_events = number_of_events !== null ? number_of_events : 1;
    }

    return { success: true, cdr, errors: [] };
  } catch (error) {
    errors.push(`Mapping error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { success: false, errors };
  }
}

/**
 * Extract field from record (tries multiple field names)
 */
function extractField(record: RawRecord, fieldNames: string[]): string | null {
  for (const fieldName of fieldNames) {
    const value = record[fieldName];
    if (value !== undefined && value !== null && value !== '') {
      return String(value).trim();
    }
  }
  return null;
}

/**
 * Extract numeric field from record
 */
function extractNumericField(record: RawRecord, fieldNames: string[]): number | null {
  for (const fieldName of fieldNames) {
    const value = record[fieldName];
    if (value !== undefined && value !== null && value !== '') {
      const num = Number(value);
      if (!isNaN(num)) {
        return num;
      }
    }
  }
  return null;
}

/**
 * Extract and normalize date field
 */
function extractDateField(record: RawRecord, fieldNames: string[]): string | null {
  for (const fieldName of fieldNames) {
    const value = record[fieldName];
    if (value !== undefined && value !== null && value !== '') {
      try {
        // Try to parse as date
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      } catch {
        // Continue to next field
      }
    }
  }
  return null;
}

/**
 * Extract and normalize call type
 */
function extractCallType(record: RawRecord): 'VOICE' | 'SMS' | null {
  const callTypeField = extractField(record, ['call_type', 'service_type', 'message_type']);

  if (!callTypeField) return null;

  const normalized = callTypeField.toUpperCase();

  if (normalized === 'VOICE' || normalized === 'CALL' || normalized === 'MOC' || normalized === 'MTC') {
    return 'VOICE';
  }

  if (normalized === 'SMS' || normalized === 'MESSAGE' || normalized === 'SMS_MO' || normalized === 'SMS_MT') {
    return 'SMS';
  }

  return null;
}

/**
 * Batch map multiple records to CDRs
 */
export function batchMapToCDR(
  records: RawRecord[],
  partnerId: string,
  direction: 'INCOMING' | 'OUTGOING'
): {
  cdrs: CDR[];
  errors: Array<{ recordIndex: number; errors: string[] }>;
  successCount: number;
  failureCount: number;
} {
  const cdrs: CDR[] = [];
  const errors: Array<{ recordIndex: number; errors: string[] }> = [];

  records.forEach((record, index) => {
    const result = mapToCDR(record, partnerId, direction);

    if (result.success && result.cdr) {
      cdrs.push(result.cdr);
    } else {
      errors.push({
        recordIndex: index + 1,
        errors: result.errors,
      });
    }
  });

  return {
    cdrs,
    errors,
    successCount: cdrs.length,
    failureCount: errors.length,
  };
}

/**
 * Validate EDR record has minimum required fields
 */
export function validateEDRRecord(record: RawRecord): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const requiredFields = [
    ['calling_number', 'originating_number', 'a_number'],
    ['called_number', 'destination_number', 'b_number'],
    ['call_type', 'service_type'],
    ['event_date_time', 'call_date_time', 'timestamp'],
  ];

  requiredFields.forEach((fieldNames) => {
    const hasField = fieldNames.some(
      (name) => record[name] !== undefined && record[name] !== null && record[name] !== ''
    );
    if (!hasField) {
      errors.push(`Missing required field: ${fieldNames.join(' or ')}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

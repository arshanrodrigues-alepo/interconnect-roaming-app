/**
 * TAP File Parser Service
 *
 * Parses TAP files in various formats (CSV, JSON) and extracts records
 */

interface ParsedRecord {
  [key: string]: any;
}

export interface ParseResult {
  success: boolean;
  records: ParsedRecord[];
  errors: string[];
  format: 'CSV' | 'JSON' | 'UNKNOWN';
  recordCount: number;
}

/**
 * Parse TAP file from buffer
 */
export async function parseTAPFile(
  fileBuffer: Buffer,
  filename: string
): Promise<ParseResult> {
  const fileContent = fileBuffer.toString('utf-8');
  const fileExt = filename.substring(filename.lastIndexOf('.')).toLowerCase();

  // Determine format and parse accordingly
  if (fileExt === '.json') {
    return parseJSON(fileContent);
  } else if (fileExt === '.csv' || fileExt === '.txt') {
    return parseCSV(fileContent);
  } else {
    // Try to auto-detect format
    return autoDetectAndParse(fileContent);
  }
}

/**
 * Parse JSON format
 */
function parseJSON(content: string): ParseResult {
  const errors: string[] = [];

  try {
    const data = JSON.parse(content);

    // Handle both array and single object
    let records: ParsedRecord[] = [];
    if (Array.isArray(data)) {
      records = data;
    } else if (data.records && Array.isArray(data.records)) {
      records = data.records;
    } else {
      records = [data];
    }

    return {
      success: true,
      records,
      errors: [],
      format: 'JSON',
      recordCount: records.length,
    };
  } catch (error) {
    errors.push(`JSON parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      success: false,
      records: [],
      errors,
      format: 'JSON',
      recordCount: 0,
    };
  }
}

/**
 * Parse CSV format
 */
function parseCSV(content: string): ParseResult {
  const errors: string[] = [];
  const records: ParsedRecord[] = [];

  try {
    const lines = content.split('\n').filter((line) => line.trim() !== '');

    if (lines.length === 0) {
      errors.push('Empty file');
      return { success: false, records: [], errors, format: 'CSV', recordCount: 0 };
    }

    // Parse header
    const headers = lines[0]
      .split(',')
      .map((h) => h.trim().replace(/^"|"$/g, ''));

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const values = parseCSVLine(line);

        if (values.length !== headers.length) {
          errors.push(
            `Line ${i + 1}: Column count mismatch (expected ${headers.length}, got ${values.length})`
          );
          continue;
        }

        const record: ParsedRecord = {};
        headers.forEach((header, index) => {
          record[header] = values[index];
        });

        records.push(record);
      } catch (error) {
        errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
      }
    }

    return {
      success: records.length > 0,
      records,
      errors,
      format: 'CSV',
      recordCount: records.length,
    };
  } catch (error) {
    errors.push(`CSV parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      success: false,
      records: [],
      errors,
      format: 'CSV',
      recordCount: 0,
    };
  }
}

/**
 * Parse a single CSV line (handles quoted values with commas)
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values.map((v) => v.replace(/^"|"$/g, ''));
}

/**
 * Auto-detect format and parse
 */
function autoDetectAndParse(content: string): ParseResult {
  // Try JSON first
  try {
    JSON.parse(content);
    return parseJSON(content);
  } catch {
    // Not JSON, try CSV
    return parseCSV(content);
  }
}

/**
 * Validate file size
 */
export function validateFileSize(sizeBytes: number): { valid: boolean; error?: string } {
  const maxSize = 100 * 1024 * 1024; // 100MB

  if (sizeBytes > maxSize) {
    return {
      valid: false,
      error: `File size ${(sizeBytes / 1024 / 1024).toFixed(2)}MB exceeds maximum ${maxSize / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

/**
 * Validate file format
 */
export function validateFileFormat(filename: string): { valid: boolean; error?: string } {
  const validExtensions = ['.csv', '.json', '.txt', '.tap'];
  const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();

  if (!validExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Invalid file format. Supported formats: ${validExtensions.join(', ')}`,
    };
  }

  return { valid: true };
}

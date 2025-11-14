# Sample TAP Files for Testing

This directory contains sample TAP files that you can use to test the TAP file processing functionality.

## Files

### 1. `sample-tap-voice.csv`
- **Format**: CSV
- **Records**: 10 voice call records
- **Fields**: calling_number, called_number, call_type, duration, event_date_time
- **Use case**: Testing voice call processing and rating

### 2. `sample-tap-sms.csv`
- **Format**: CSV
- **Records**: 10 SMS records
- **Fields**: calling_number, called_number, call_type, number_of_events, event_date_time
- **Use case**: Testing SMS processing and rating

### 3. `sample-tap-mixed.json`
- **Format**: JSON
- **Records**: 5 mixed (voice + SMS) records
- **Use case**: Testing JSON format parsing and mixed traffic types

## How to Use

1. Navigate to `/tap` in the application
2. Click "Upload TAP File" button
3. Drag and drop one of these sample files or click to browse
4. The file will be automatically:
   - Parsed (CSV or JSON)
   - Validated against EDR schemas
   - Converted to CDRs
   - Sent to rating engine
   - Charged based on partner rate sheets

## Expected Results

For **Verizon (partner_id: 550e8400-e29b-41d4-a716-446655440000)**:

### Voice Rates:
- **+1** (USA): $0.012/second with $0.50 minimum charge
- **+44** (UK): Would use default fallback rate
- **+81** (Japan): Would use default fallback rate

### SMS Rates:
- **+1** (USA): $0.04/message with $0.01 minimum charge
- **+44** (UK): Would use default fallback rate
- **+81** (Japan): Would use default fallback rate

## File Format Specifications

### CSV Format
```csv
calling_number,called_number,call_type,duration,event_date_time
+14155551234,+442071234567,VOICE,125,2025-01-15T10:30:00Z
```

**Required fields**:
- `calling_number` or `originating_number`
- `called_number` or `destination_number`
- `call_type` or `service_type` (VOICE or SMS)
- `event_date_time` or `call_date_time`
- For VOICE: `duration` or `duration_seconds` (in seconds)
- For SMS: `number_of_events` or `message_count`

### JSON Format
```json
[
  {
    "calling_number": "+14155551234",
    "called_number": "+442071234567",
    "call_type": "VOICE",
    "duration": 125,
    "event_date_time": "2025-01-15T10:30:00Z"
  }
]
```

**Note**: JSON can be either an array of records or a single object with a `records` property containing an array.

## Processing Flow

1. **Upload** → File uploaded to `/api/tap/upload`
2. **Parsing** → File parsed by `tap-parser.ts`
3. **Mapping** → Records mapped to CDRs by `edr-mapper.ts`
4. **Rating** → CDRs rated by `/api/rating-engine/batch`
5. **Storage** → Results stored as TAPRecords
6. **Display** → View in `/tap/[id]` detail page

## Troubleshooting

If upload fails:
- Check file format matches CSV or JSON specification
- Ensure required fields are present
- Verify file size is under 100MB
- Check that dates are in ISO 8601 format
- Ensure phone numbers are in E.164 format (+country_code...)

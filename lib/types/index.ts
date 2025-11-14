// Core Entity Types based on PRD Phase 1

export type PartnerType = 'VENDOR' | 'CUSTOMER' | 'RECIPROCAL';
export type PartnerStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
export type AgreementType = 'INTERCONNECT' | 'ROAMING' | 'BOTH';
export type AgreementStatus = 'DRAFT' | 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
export type PolicyStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'ACTIVE';
export type ServiceType = 'VOICE' | 'SMS' | 'DATA' | 'MMS';
export type UnitOfMeasure = 'SECONDS' | 'MESSAGE' | 'MB' | 'SESSION';
export type Direction = 'INBOUND' | 'OUTBOUND';
export type RoundingRule = 'UP' | 'DOWN' | 'NEAREST';
export type ProcessingStatus = 'PENDING' | 'RATED' | 'SETTLED' | 'DISPUTED';
export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'DISPUTED' | 'CANCELLED';
export type DisputeType = 'BILLING' | 'TECHNICAL' | 'QUALITY' | 'OTHER';
export type DisputeStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED' | 'ESCALATED';
export type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'CUSTOM';
export type TAPFileStatus = 'UPLOADED' | 'PARSING' | 'PARSED' | 'RATED' | 'ERROR';
export type AnomalyType = 'UNUSUAL_TRAFFIC_VOLUME' | 'HIGH_COST_DESTINATION' | 'VELOCITY_ANOMALY' | 'SUCCESS_RATE_DROP' | 'UNUSUAL_CALL_DURATION' | 'LATE_NIGHT_TRAFFIC';
export type AnomalySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AnomalyStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';

// 3.1.1 Partner Entity
export interface Partner {
  partner_id: string;
  partner_code: string;
  partner_name: string;
  partner_type: PartnerType;
  country_code: string;
  status: PartnerStatus;
  contact_email: string;
  contact_phone?: string;
  created_at: string;
  updated_at: string;
}

// 3.1.2 Agreement Entity
export interface Agreement {
  agreement_id: string;
  partner_id: string;
  agreement_name: string;
  agreement_type: AgreementType;
  start_date: string;
  end_date?: string;
  status: AgreementStatus;
  policy_status: PolicyStatus;
  document_template: string; // Markdown or text content
  contract_file_url?: string;
  raex_form_url?: string;
  currency: string;
  billing_cycle: BillingCycle;
  created_at: string;
  updated_at: string;
}

// Rate Sheet Entity (replaces/extends RatePlan)
export interface RateSheet {
  rate_sheet_id: string;
  partner_id: string;
  rate_sheet_name: string;
  effective_date: string;
  expiry_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Rate Entry within a Rate Sheet
export interface Rate {
  rate_id: string;
  rate_sheet_id: string;
  service_type: ServiceType;
  direction: Direction;
  called_number_prefix?: string; // For prefix-based rating
  call_type?: string; // Additional categorization
  rate_per_unit: number;
  currency: string;
  minimum_charge?: number;
  rounding_rule: RoundingRule;
  tier_start?: number; // For tiered pricing
  tier_end?: number;
}

// 3.1.3 Service Entity
export interface Service {
  service_id: string;
  service_type: ServiceType;
  service_name: string;
  unit_of_measure: UnitOfMeasure;
  is_active: boolean;
}

// 3.1.4 RatePlan Entity
export interface RatePlan {
  rate_plan_id: string;
  agreement_id: string;
  service_id: string;
  service_type?: ServiceType;
  direction: Direction;
  rate_per_unit: number;
  currency: string;
  effective_from: string;
  effective_to?: string;
  rounding_rule: RoundingRule;
  minimum_charge?: number;
}

// 3.1.5 TAPRecord Entity
export interface TAPRecord {
  tap_record_id: string;
  tap_file_id: string;
  partner_id: string;
  service_type: ServiceType;
  call_date_time: string;
  msisdn: string;
  imsi?: string;
  duration_seconds?: number;
  data_volume_mb?: number;
  message_count?: number;
  charged_amount?: number;
  currency?: string;
  processing_status: ProcessingStatus;
  raw_tap_data?: Record<string, any>;
}

// TAP File Entity
export interface TAPFile {
  tap_file_id: string;
  partner_id: string;
  filename: string;
  file_size_bytes: number;
  direction: Direction;
  status: TAPFileStatus;
  upload_timestamp: string;
  processed_timestamp?: string;
  records_count?: number;
  total_charges?: number;
  error_message?: string;
}

// 3.1.6 Invoice Entity
export interface Invoice {
  invoice_id: string;
  invoice_number: string;
  partner_id: string;
  billing_period_start: string;
  billing_period_end: string;
  total_amount: number;
  currency: string;
  status: InvoiceStatus;
  invoice_date: string;
  due_date?: string;
  pdf_url?: string;
  line_items?: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  service_type: ServiceType;
  direction: Direction;
  total_units: number;
  rate: number;
  amount: number;
}

// 3.1.7 Dispute Entity
export interface Dispute {
  dispute_id: string;
  dispute_number: string;
  invoice_id?: string;
  partner_id: string;
  dispute_type: DisputeType;
  status: DisputeStatus;
  description: string;
  disputed_amount?: number;
  resolution?: string;
  created_at: string;
  resolved_at?: string;
  created_by?: string;
  assigned_to?: string;
}

// Anomaly Detection Entity
export interface Anomaly {
  anomaly_id: string;
  partner_id: string;
  detected_at: string;
  anomaly_type: AnomalyType;
  severity: AnomalySeverity;
  description: string;
  affected_services: ServiceType[];
  metrics: Record<string, any>;
  status: AnomalyStatus;
  recommended_action: string;
  investigated_by?: string;
  investigation_notes?: string;
}

// Dashboard Analytics Types
export interface TrafficSummary {
  voice_minutes: number;
  sms_count: number;
  data_mb: number;
}

export interface RevenueSummary {
  total_charges: number;
  voice_revenue: number;
  sms_revenue: number;
  data_revenue: number;
  margin_percentage: number;
}

export interface SLACompliance {
  availability_percentage: number;
  average_success_rate: number;
  average_latency_ms: number;
}

export interface DashboardData {
  partner_id: string;
  period: string;
  from_date: string;
  to_date: string;
  traffic_summary: TrafficSummary;
  revenue_summary: RevenueSummary;
  sla_compliance: SLACompliance;
}

// RAEX Form Entity
export interface RAEXForm {
  raex_id: string;
  agreement_id: string;
  network_name: string;
  tadig_code: string;
  mcc: string;
  mnc: string;
  supported_technologies: string[];
  volte_capable: boolean;
  sccp_address: string;
  diameter_endpoint: string;
  tap_version: string;
  file_exchange_protocol: string;
  created_at: string;
}

// Test Call Entity
export interface TestCall {
  test_id: string;
  partner_id: string;
  test_type: 'VOICE_CALL' | 'SMS' | 'DATA_SESSION' | 'VOLTE' | 'REGISTRATION';
  direction: 'MO' | 'MT';
  source_msisdn: string;
  destination_msisdn: string;
  scheduled_time: string;
  executed_at?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  result?: 'SUCCESS' | 'FAILED';
  quality_metrics?: {
    mos_score?: number;
    packet_loss_percentage?: number;
    jitter_ms?: number;
    latency_ms?: number;
  };
  details?: Record<string, any>;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_records: number;
    limit: number;
  };
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// CDR/EDR Types for Rating Engine
export interface CDR {
  cdr_id?: string;
  calling_number: string;
  called_number: string;
  call_type: 'VOICE' | 'SMS';
  duration?: number; // in seconds for Voice
  number_of_events?: number; // for SMS
  direction: 'INCOMING' | 'OUTGOING';
  date_of_event: string;
  operator_id: string; // Partner ID
  charge?: number; // Calculated by rating engine
  currency?: string;
  rate_applied?: number;
  processing_status?: 'PENDING' | 'RATED' | 'FAILED';
  error_message?: string;
}

// Policy Document Types
export interface PolicyDocument {
  policy_id: string;
  policy_type: 'AGREEMENT_TEMPLATE' | 'SMS_REVENUE_COMMITMENT' | 'TAX_POLICY' | 'CUSTOM';
  policy_name: string;
  content: string; // Markdown or text
  version: string;
  status: PolicyStatus;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// EDR Format Schemas
export interface EDRSchema {
  schema_id: string;
  schema_name: string;
  service_type: ServiceType;
  direction: Direction;
  schema_definition: Record<string, any>; // JSON schema
  created_at: string;
}

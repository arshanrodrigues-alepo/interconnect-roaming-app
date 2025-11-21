-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PARTNER', 'FINANCE', 'SUPPORT');

-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('VENDOR', 'CUSTOMER', 'RECIPROCAL');

-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AgreementType" AS ENUM ('INTERCONNECT', 'ROAMING', 'BOTH');

-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('DRAFT', 'PENDING', 'ACTIVE', 'EXPIRED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'ACTIVE');

-- CreateEnum
CREATE TYPE "BillingFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('VOICE', 'SMS', 'DATA', 'MMS');

-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "RoundingRule" AS ENUM ('UP', 'DOWN', 'NEAREST', 'NONE');

-- CreateEnum
CREATE TYPE "TAPFileStatus" AS ENUM ('UPLOADED', 'PARSING', 'PARSED', 'RATED', 'ERROR');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('PENDING', 'RATED', 'SETTLED', 'DISPUTED', 'FAILED');

-- CreateEnum
CREATE TYPE "BillingCycleStatus" AS ENUM ('OPEN', 'PROCESSING', 'INVOICED', 'CLOSED', 'DISPUTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PAID', 'PARTIALLY_PAID', 'DISPUTED', 'CANCELLED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'WIRE_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'CHEQUE', 'NETTING', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CLEARED', 'FAILED', 'REVERSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('VOLUME', 'PROMOTIONAL', 'EARLY_PAYMENT', 'LOYALTY', 'COMMITMENT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "DiscountUnit" AS ENUM ('PERCENTAGE', 'FLAT_AMOUNT');

-- CreateEnum
CREATE TYPE "ReconciliationStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'MATCHED', 'DISCREPANCY', 'RESOLVED', 'DISPUTED', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('IDENTIFIED', 'INVESTIGATING', 'RESOLVED', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DisputeType" AS ENUM ('BILLING', 'TECHNICAL', 'QUALITY', 'OTHER');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AnomalyType" AS ENUM ('UNUSUAL_TRAFFIC_VOLUME', 'HIGH_COST_DESTINATION', 'VELOCITY_ANOMALY', 'SUCCESS_RATE_DROP', 'UNUSUAL_CALL_DURATION', 'LATE_NIGHT_TRAFFIC', 'IRSF_SUSPECTED', 'SIM_BOX_FRAUD', 'WANGIRI_FRAUD');

-- CreateEnum
CREATE TYPE "AnomalySeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AnomalyStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE');

-- CreateEnum
CREATE TYPE "TestType" AS ENUM ('VOICE_CALL', 'SMS', 'DATA_SESSION', 'VOLTE', 'VOWIFI', 'REGISTRATION');

-- CreateEnum
CREATE TYPE "TestDirection" AS ENUM ('MO', 'MT');

-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TestResult" AS ENUM ('SUCCESS', 'FAILED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "PolicyDocType" AS ENUM ('AGREEMENT_TEMPLATE', 'SMS_REVENUE_COMMITMENT', 'TAX_POLICY', 'CUSTOM');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "partner_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" UUID NOT NULL,
    "partner_code" VARCHAR(20) NOT NULL,
    "partner_name" VARCHAR(255) NOT NULL,
    "partner_type" "PartnerType" NOT NULL,
    "country_code" VARCHAR(3) NOT NULL,
    "status" "PartnerStatus" NOT NULL DEFAULT 'PENDING',
    "contact_email" VARCHAR(255) NOT NULL,
    "contact_phone" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agreements" (
    "id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "agreement_name" VARCHAR(255) NOT NULL,
    "agreement_type" "AgreementType" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "status" "AgreementStatus" NOT NULL DEFAULT 'DRAFT',
    "policy_status" "PolicyStatus" NOT NULL DEFAULT 'DRAFT',
    "document_template" TEXT,
    "contract_file_url" TEXT,
    "raex_form_url" TEXT,
    "currency" VARCHAR(3) NOT NULL,
    "billing_cycle" "BillingFrequency" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_sheets" (
    "id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "rate_sheet_name" VARCHAR(255) NOT NULL,
    "effective_date" DATE NOT NULL,
    "expiry_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_sheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rates" (
    "id" UUID NOT NULL,
    "rate_sheet_id" UUID NOT NULL,
    "service_type" "ServiceType" NOT NULL,
    "direction" "Direction" NOT NULL,
    "called_number_prefix" VARCHAR(20),
    "call_type" VARCHAR(50),
    "rate_per_unit" DECIMAL(10,6) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "minimum_charge" DECIMAL(10,6),
    "rounding_rule" "RoundingRule" NOT NULL,
    "tier_start" INTEGER,
    "tier_end" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_plans" (
    "id" UUID NOT NULL,
    "agreement_id" UUID NOT NULL,
    "service_type" "ServiceType" NOT NULL,
    "direction" "Direction" NOT NULL,
    "rate_per_unit" DECIMAL(10,6) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "rounding_rule" "RoundingRule" NOT NULL,
    "minimum_charge" DECIMAL(10,6),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rate_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tap_files" (
    "id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "file_size_bytes" BIGINT NOT NULL,
    "direction" "Direction" NOT NULL,
    "status" "TAPFileStatus" NOT NULL DEFAULT 'UPLOADED',
    "upload_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_timestamp" TIMESTAMP(3),
    "records_count" INTEGER,
    "total_charges" DECIMAL(15,2),
    "error_message" TEXT,

    CONSTRAINT "tap_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tap_records" (
    "id" UUID NOT NULL,
    "tap_file_id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "service_type" "ServiceType" NOT NULL,
    "call_date_time" TIMESTAMP(3) NOT NULL,
    "msisdn" VARCHAR(20) NOT NULL,
    "imsi" VARCHAR(15),
    "calling_number" VARCHAR(20),
    "called_number" VARCHAR(20),
    "duration_seconds" INTEGER,
    "data_volume_mb" DECIMAL(10,2),
    "message_count" INTEGER,
    "charged_amount" DECIMAL(10,6),
    "currency" VARCHAR(3),
    "processing_status" "ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "error_message" TEXT,
    "raw_tap_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tap_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_cycles" (
    "id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "cycle_number" INTEGER NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "cut_off_date" DATE NOT NULL,
    "due_date" DATE NOT NULL,
    "status" "BillingCycleStatus" NOT NULL DEFAULT 'OPEN',
    "total_tap_files" INTEGER NOT NULL DEFAULT 0,
    "total_records" INTEGER NOT NULL DEFAULT 0,
    "total_voice_minutes" INTEGER NOT NULL DEFAULT 0,
    "total_sms_count" INTEGER NOT NULL DEFAULT 0,
    "total_data_mb" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_charges" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "margin" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "discounts" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "taxes" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "invoice_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "closed_at" TIMESTAMP(3),
    "closed_by" UUID,

    CONSTRAINT "billing_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "invoice_number" VARCHAR(50) NOT NULL,
    "partner_id" UUID NOT NULL,
    "billing_period_start" DATE NOT NULL,
    "billing_period_end" DATE NOT NULL,
    "subtotal" DECIMAL(15,2) NOT NULL,
    "tax_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(15,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "invoice_date" DATE NOT NULL,
    "due_date" DATE,
    "paid_date" DATE,
    "pdf_url" TEXT,
    "notes" TEXT,
    "line_items" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "payment_number" VARCHAR(50) NOT NULL,
    "invoice_id" UUID NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "payment_date" DATE NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "reference_number" VARCHAR(100),
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discounts" (
    "id" UUID NOT NULL,
    "discount_code" VARCHAR(50) NOT NULL,
    "partner_id" UUID,
    "discount_type" "DiscountType" NOT NULL,
    "discount_value" DECIMAL(10,4) NOT NULL,
    "discount_unit" "DiscountUnit" NOT NULL,
    "description" TEXT,
    "min_charges" DECIMAL(15,2),
    "max_discount" DECIMAL(15,2),
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliations" (
    "id" UUID NOT NULL,
    "reconciliation_number" VARCHAR(50) NOT NULL,
    "partner_id" UUID NOT NULL,
    "billing_cycle_id" UUID,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "our_invoice_id" UUID,
    "our_amount" DECIMAL(15,2) NOT NULL,
    "our_record_count" INTEGER NOT NULL,
    "their_invoice_number" VARCHAR(50),
    "their_amount" DECIMAL(15,2) NOT NULL,
    "their_record_count" INTEGER NOT NULL,
    "amount_difference" DECIMAL(15,2) NOT NULL,
    "difference_percentage" DECIMAL(6,3) NOT NULL,
    "record_count_difference" INTEGER NOT NULL,
    "status" "ReconciliationStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "resolved_at" TIMESTAMP(3),
    "resolved_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reconciliations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation_items" (
    "id" UUID NOT NULL,
    "reconciliation_id" UUID NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "our_value" DECIMAL(15,4),
    "their_value" DECIMAL(15,4),
    "impact" DECIMAL(15,2) NOT NULL,
    "status" "ItemStatus" NOT NULL DEFAULT 'IDENTIFIED',
    "resolution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reconciliation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" UUID NOT NULL,
    "dispute_number" VARCHAR(50) NOT NULL,
    "invoice_id" UUID,
    "partner_id" UUID NOT NULL,
    "dispute_type" "DisputeType" NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT NOT NULL,
    "disputed_amount" DECIMAL(15,2),
    "resolution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_id" UUID,
    "assigned_to_id" UUID,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anomalies" (
    "id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "anomaly_type" "AnomalyType" NOT NULL,
    "severity" "AnomalySeverity" NOT NULL,
    "description" TEXT NOT NULL,
    "affected_services" "ServiceType"[],
    "metrics" JSONB NOT NULL,
    "status" "AnomalyStatus" NOT NULL DEFAULT 'OPEN',
    "recommended_action" TEXT NOT NULL,
    "investigated_by_id" UUID,
    "investigation_notes" TEXT,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "anomalies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raex_forms" (
    "id" UUID NOT NULL,
    "agreement_id" UUID NOT NULL,
    "network_name" VARCHAR(255) NOT NULL,
    "tadig_code" VARCHAR(20) NOT NULL,
    "mcc" VARCHAR(3) NOT NULL,
    "mnc" VARCHAR(3) NOT NULL,
    "supported_technologies" TEXT[],
    "volte_capable" BOOLEAN NOT NULL DEFAULT false,
    "vowifi_capable" BOOLEAN NOT NULL DEFAULT false,
    "rcs_capable" BOOLEAN NOT NULL DEFAULT false,
    "sccp_address" VARCHAR(50),
    "diameter_endpoint" VARCHAR(255),
    "tap_version" VARCHAR(10) NOT NULL,
    "file_exchange_protocol" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raex_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_calls" (
    "id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "test_type" "TestType" NOT NULL,
    "direction" "TestDirection" NOT NULL,
    "source_msisdn" VARCHAR(20) NOT NULL,
    "destination_msisdn" VARCHAR(20) NOT NULL,
    "scheduled_time" TIMESTAMP(3) NOT NULL,
    "executed_at" TIMESTAMP(3),
    "status" "TestStatus" NOT NULL DEFAULT 'SCHEDULED',
    "result" "TestResult",
    "quality_metrics" JSONB,
    "details" JSONB,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_documents" (
    "id" UUID NOT NULL,
    "policy_type" "PolicyDocType" NOT NULL,
    "policy_name" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "version" VARCHAR(20) NOT NULL,
    "status" "PolicyStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" VARCHAR(255),

    CONSTRAINT "policy_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "partners_partner_code_key" ON "partners"("partner_code");

-- CreateIndex
CREATE INDEX "partners_partner_code_idx" ON "partners"("partner_code");

-- CreateIndex
CREATE INDEX "partners_status_idx" ON "partners"("status");

-- CreateIndex
CREATE INDEX "partners_country_code_idx" ON "partners"("country_code");

-- CreateIndex
CREATE INDEX "agreements_partner_id_idx" ON "agreements"("partner_id");

-- CreateIndex
CREATE INDEX "agreements_status_idx" ON "agreements"("status");

-- CreateIndex
CREATE INDEX "rate_sheets_partner_id_idx" ON "rate_sheets"("partner_id");

-- CreateIndex
CREATE INDEX "rate_sheets_is_active_idx" ON "rate_sheets"("is_active");

-- CreateIndex
CREATE INDEX "rate_sheets_effective_date_idx" ON "rate_sheets"("effective_date");

-- CreateIndex
CREATE INDEX "rates_rate_sheet_id_idx" ON "rates"("rate_sheet_id");

-- CreateIndex
CREATE INDEX "rates_service_type_direction_idx" ON "rates"("service_type", "direction");

-- CreateIndex
CREATE INDEX "rates_called_number_prefix_idx" ON "rates"("called_number_prefix");

-- CreateIndex
CREATE INDEX "rate_plans_agreement_id_idx" ON "rate_plans"("agreement_id");

-- CreateIndex
CREATE INDEX "rate_plans_effective_from_idx" ON "rate_plans"("effective_from");

-- CreateIndex
CREATE INDEX "tap_files_partner_id_idx" ON "tap_files"("partner_id");

-- CreateIndex
CREATE INDEX "tap_files_status_idx" ON "tap_files"("status");

-- CreateIndex
CREATE INDEX "tap_files_upload_timestamp_idx" ON "tap_files"("upload_timestamp");

-- CreateIndex
CREATE INDEX "tap_records_tap_file_id_idx" ON "tap_records"("tap_file_id");

-- CreateIndex
CREATE INDEX "tap_records_partner_id_idx" ON "tap_records"("partner_id");

-- CreateIndex
CREATE INDEX "tap_records_processing_status_idx" ON "tap_records"("processing_status");

-- CreateIndex
CREATE INDEX "tap_records_call_date_time_idx" ON "tap_records"("call_date_time");

-- CreateIndex
CREATE INDEX "tap_records_msisdn_idx" ON "tap_records"("msisdn");

-- CreateIndex
CREATE UNIQUE INDEX "billing_cycles_invoice_id_key" ON "billing_cycles"("invoice_id");

-- CreateIndex
CREATE INDEX "billing_cycles_partner_id_idx" ON "billing_cycles"("partner_id");

-- CreateIndex
CREATE INDEX "billing_cycles_cycle_number_idx" ON "billing_cycles"("cycle_number");

-- CreateIndex
CREATE INDEX "billing_cycles_status_idx" ON "billing_cycles"("status");

-- CreateIndex
CREATE INDEX "billing_cycles_period_start_period_end_idx" ON "billing_cycles"("period_start", "period_end");

-- CreateIndex
CREATE UNIQUE INDEX "billing_cycles_partner_id_cycle_number_key" ON "billing_cycles"("partner_id", "cycle_number");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_partner_id_idx" ON "invoices"("partner_id");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_invoice_date_idx" ON "invoices"("invoice_date");

-- CreateIndex
CREATE INDEX "invoices_due_date_idx" ON "invoices"("due_date");

-- CreateIndex
CREATE UNIQUE INDEX "payments_payment_number_key" ON "payments"("payment_number");

-- CreateIndex
CREATE INDEX "payments_invoice_id_idx" ON "payments"("invoice_id");

-- CreateIndex
CREATE INDEX "payments_payment_date_idx" ON "payments"("payment_date");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "discounts_discount_code_key" ON "discounts"("discount_code");

-- CreateIndex
CREATE INDEX "discounts_partner_id_idx" ON "discounts"("partner_id");

-- CreateIndex
CREATE INDEX "discounts_discount_type_idx" ON "discounts"("discount_type");

-- CreateIndex
CREATE INDEX "discounts_is_active_idx" ON "discounts"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "reconciliations_reconciliation_number_key" ON "reconciliations"("reconciliation_number");

-- CreateIndex
CREATE INDEX "reconciliations_partner_id_idx" ON "reconciliations"("partner_id");

-- CreateIndex
CREATE INDEX "reconciliations_billing_cycle_id_idx" ON "reconciliations"("billing_cycle_id");

-- CreateIndex
CREATE INDEX "reconciliations_status_idx" ON "reconciliations"("status");

-- CreateIndex
CREATE INDEX "reconciliation_items_reconciliation_id_idx" ON "reconciliation_items"("reconciliation_id");

-- CreateIndex
CREATE UNIQUE INDEX "disputes_dispute_number_key" ON "disputes"("dispute_number");

-- CreateIndex
CREATE INDEX "disputes_partner_id_idx" ON "disputes"("partner_id");

-- CreateIndex
CREATE INDEX "disputes_status_idx" ON "disputes"("status");

-- CreateIndex
CREATE INDEX "disputes_priority_idx" ON "disputes"("priority");

-- CreateIndex
CREATE INDEX "disputes_created_at_idx" ON "disputes"("created_at");

-- CreateIndex
CREATE INDEX "anomalies_partner_id_idx" ON "anomalies"("partner_id");

-- CreateIndex
CREATE INDEX "anomalies_status_idx" ON "anomalies"("status");

-- CreateIndex
CREATE INDEX "anomalies_severity_idx" ON "anomalies"("severity");

-- CreateIndex
CREATE INDEX "anomalies_detected_at_idx" ON "anomalies"("detected_at");

-- CreateIndex
CREATE INDEX "raex_forms_agreement_id_idx" ON "raex_forms"("agreement_id");

-- CreateIndex
CREATE INDEX "raex_forms_tadig_code_idx" ON "raex_forms"("tadig_code");

-- CreateIndex
CREATE INDEX "test_calls_partner_id_idx" ON "test_calls"("partner_id");

-- CreateIndex
CREATE INDEX "test_calls_status_idx" ON "test_calls"("status");

-- CreateIndex
CREATE INDEX "test_calls_scheduled_time_idx" ON "test_calls"("scheduled_time");

-- CreateIndex
CREATE INDEX "policy_documents_policy_type_idx" ON "policy_documents"("policy_type");

-- CreateIndex
CREATE INDEX "policy_documents_status_idx" ON "policy_documents"("status");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_sheets" ADD CONSTRAINT "rate_sheets_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rates" ADD CONSTRAINT "rates_rate_sheet_id_fkey" FOREIGN KEY ("rate_sheet_id") REFERENCES "rate_sheets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_plans" ADD CONSTRAINT "rate_plans_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tap_files" ADD CONSTRAINT "tap_files_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tap_records" ADD CONSTRAINT "tap_records_tap_file_id_fkey" FOREIGN KEY ("tap_file_id") REFERENCES "tap_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tap_records" ADD CONSTRAINT "tap_records_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_cycles" ADD CONSTRAINT "billing_cycles_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_cycles" ADD CONSTRAINT "billing_cycles_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliations" ADD CONSTRAINT "reconciliations_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliations" ADD CONSTRAINT "reconciliations_billing_cycle_id_fkey" FOREIGN KEY ("billing_cycle_id") REFERENCES "billing_cycles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_items" ADD CONSTRAINT "reconciliation_items_reconciliation_id_fkey" FOREIGN KEY ("reconciliation_id") REFERENCES "reconciliations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anomalies" ADD CONSTRAINT "anomalies_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anomalies" ADD CONSTRAINT "anomalies_investigated_by_id_fkey" FOREIGN KEY ("investigated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raex_forms" ADD CONSTRAINT "raex_forms_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_calls" ADD CONSTRAINT "test_calls_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

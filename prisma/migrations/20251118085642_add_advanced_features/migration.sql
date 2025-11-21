-- CreateEnum
CREATE TYPE "PricelistUpdateType" AS ENUM ('FULL', 'PARTIAL', 'DELTA');

-- CreateEnum
CREATE TYPE "PricelistStatus" AS ENUM ('PENDING', 'VALIDATED', 'ACTIVE', 'EXPIRED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BillingIncrement" AS ENUM ('PER_SECOND', 'PER_MINUTE', 'SIXTY_SIXTY');

-- CreateEnum
CREATE TYPE "CreditStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BLOCKED', 'UNDER_REVIEW');

-- CreateEnum
CREATE TYPE "CommitmentType" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUAL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "CommitmentStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'TERMINATED', 'BREACHED');

-- CreateEnum
CREATE TYPE "SchemeType" AS ENUM ('TIERED_RATE', 'FIXED_RATE', 'REBATE', 'VOLUME_BASED');

-- CreateEnum
CREATE TYPE "AppliesTo" AS ENUM ('VOLUME', 'REVENUE', 'BOTH');

-- CreateEnum
CREATE TYPE "SchemeStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ReconciliationType" AS ENUM ('XDR', 'DAILY', 'INVOICE', 'FINANCIAL');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "MetricWindow" AS ENUM ('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "NumberPlanStatus" AS ENUM ('ACTIVE', 'DEPRECATED', 'RESERVED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "TimebandName" AS ENUM ('PEAK', 'OFF_PEAK', 'WEEKEND', 'HOLIDAY', 'SPECIAL');

-- CreateEnum
CREATE TYPE "AppliesOnDay" AS ENUM ('ALL_DAYS', 'WEEKDAYS', 'WEEKENDS', 'SPECIFIC');

-- CreateTable
CREATE TABLE "carrier_pricelists" (
    "id" UUID NOT NULL,
    "carrier_id" UUID NOT NULL,
    "effective_date" DATE NOT NULL,
    "expiry_date" DATE,
    "notice_period_days" INTEGER NOT NULL,
    "update_type" "PricelistUpdateType" NOT NULL,
    "source_file_url" TEXT,
    "status" "PricelistStatus" NOT NULL DEFAULT 'PENDING',
    "confirmation_sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carrier_pricelists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carrier_rates" (
    "id" UUID NOT NULL,
    "pricelist_id" UUID NOT NULL,
    "destination_code" VARCHAR(20) NOT NULL,
    "destination_name" VARCHAR(255) NOT NULL,
    "rate_per_minute" DECIMAL(10,6) NOT NULL,
    "billing_increment" "BillingIncrement" NOT NULL,
    "asr_percentage" DECIMAL(5,2),
    "acd_seconds" INTEGER,
    "peak_rate" DECIMAL(10,6),
    "offpeak_rate" DECIMAL(10,6),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carrier_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_profiles" (
    "id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "credit_limit" DECIMAL(15,2) NOT NULL,
    "payment_terms_days" INTEGER NOT NULL,
    "surcharge_category" VARCHAR(50) NOT NULL,
    "surcharge_rate" DECIMAL(5,2) NOT NULL,
    "surcharge_trigger_days" INTEGER NOT NULL,
    "bank_guarantee_required" BOOLEAN NOT NULL DEFAULT false,
    "bank_guarantee_amount" DECIMAL(15,2),
    "bank_guarantee_expiry" DATE,
    "status" "CreditStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volume_commitments" (
    "id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "destination_group_id" UUID,
    "commitment_type" "CommitmentType" NOT NULL,
    "committed_volume_minutes" BIGINT,
    "committed_revenue_amount" DECIMAL(15,2),
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "penalty_rate" DECIMAL(5,2),
    "discount_scheme_id" UUID,
    "status" "CommitmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volume_commitments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_schemes" (
    "id" UUID NOT NULL,
    "scheme_name" VARCHAR(255) NOT NULL,
    "discount_type" "SchemeType" NOT NULL,
    "applies_to" "AppliesTo" NOT NULL,
    "valid_from" DATE NOT NULL,
    "valid_to" DATE,
    "status" "SchemeStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discount_schemes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_tiers" (
    "id" UUID NOT NULL,
    "scheme_id" UUID NOT NULL,
    "from_volume" BIGINT,
    "to_volume" BIGINT,
    "discount_percentage" DECIMAL(5,2) NOT NULL,
    "rate_adjustment" DECIMAL(10,6),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discount_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation_batches" (
    "id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "reconciliation_type" "ReconciliationType" NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "status" "BatchStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "reconciliation_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation_results" (
    "id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "expected_count" BIGINT NOT NULL,
    "received_count" BIGINT NOT NULL,
    "matched_count" BIGINT NOT NULL,
    "mismatched_count" BIGINT NOT NULL,
    "missing_records" BIGINT NOT NULL,
    "financial_impact" DECIMAL(15,2) NOT NULL,
    "dispute_flag" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reconciliation_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qos_metrics" (
    "id" UUID NOT NULL,
    "carrier_id" UUID NOT NULL,
    "destination_code" VARCHAR(20) NOT NULL,
    "asr" DECIMAL(5,2) NOT NULL,
    "acd_seconds" INTEGER NOT NULL,
    "ner" DECIMAL(5,2),
    "pdd_ms" INTEGER,
    "total_calls" BIGINT NOT NULL DEFAULT 0,
    "successful_calls" BIGINT NOT NULL DEFAULT 0,
    "window" "MetricWindow" NOT NULL,
    "window_start" TIMESTAMP(3) NOT NULL,
    "window_end" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qos_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "numbering_plans" (
    "id" UUID NOT NULL,
    "destination_code" VARCHAR(20) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "region" VARCHAR(100),
    "description" VARCHAR(255),
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "status" "NumberPlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "fraud_risk" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "numbering_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rating_timebands" (
    "id" UUID NOT NULL,
    "name" "TimebandName" NOT NULL,
    "description" VARCHAR(255),
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "applies_on" "AppliesOnDay" NOT NULL,
    "country_code" VARCHAR(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rating_timebands_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "carrier_pricelists_carrier_id_idx" ON "carrier_pricelists"("carrier_id");

-- CreateIndex
CREATE INDEX "carrier_pricelists_status_idx" ON "carrier_pricelists"("status");

-- CreateIndex
CREATE INDEX "carrier_pricelists_effective_date_idx" ON "carrier_pricelists"("effective_date");

-- CreateIndex
CREATE INDEX "carrier_rates_pricelist_id_idx" ON "carrier_rates"("pricelist_id");

-- CreateIndex
CREATE INDEX "carrier_rates_destination_code_idx" ON "carrier_rates"("destination_code");

-- CreateIndex
CREATE UNIQUE INDEX "credit_profiles_partner_id_key" ON "credit_profiles"("partner_id");

-- CreateIndex
CREATE INDEX "credit_profiles_partner_id_idx" ON "credit_profiles"("partner_id");

-- CreateIndex
CREATE INDEX "credit_profiles_status_idx" ON "credit_profiles"("status");

-- CreateIndex
CREATE INDEX "volume_commitments_partner_id_idx" ON "volume_commitments"("partner_id");

-- CreateIndex
CREATE INDEX "volume_commitments_status_idx" ON "volume_commitments"("status");

-- CreateIndex
CREATE INDEX "volume_commitments_start_date_end_date_idx" ON "volume_commitments"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "discount_schemes_status_idx" ON "discount_schemes"("status");

-- CreateIndex
CREATE INDEX "discount_schemes_valid_from_valid_to_idx" ON "discount_schemes"("valid_from", "valid_to");

-- CreateIndex
CREATE INDEX "discount_tiers_scheme_id_idx" ON "discount_tiers"("scheme_id");

-- CreateIndex
CREATE INDEX "reconciliation_batches_partner_id_idx" ON "reconciliation_batches"("partner_id");

-- CreateIndex
CREATE INDEX "reconciliation_batches_status_idx" ON "reconciliation_batches"("status");

-- CreateIndex
CREATE INDEX "reconciliation_batches_period_start_period_end_idx" ON "reconciliation_batches"("period_start", "period_end");

-- CreateIndex
CREATE INDEX "reconciliation_results_batch_id_idx" ON "reconciliation_results"("batch_id");

-- CreateIndex
CREATE INDEX "qos_metrics_carrier_id_idx" ON "qos_metrics"("carrier_id");

-- CreateIndex
CREATE INDEX "qos_metrics_destination_code_idx" ON "qos_metrics"("destination_code");

-- CreateIndex
CREATE INDEX "qos_metrics_window_idx" ON "qos_metrics"("window");

-- CreateIndex
CREATE INDEX "qos_metrics_window_start_window_end_idx" ON "qos_metrics"("window_start", "window_end");

-- CreateIndex
CREATE INDEX "numbering_plans_destination_code_idx" ON "numbering_plans"("destination_code");

-- CreateIndex
CREATE INDEX "numbering_plans_country_idx" ON "numbering_plans"("country");

-- CreateIndex
CREATE INDEX "numbering_plans_status_idx" ON "numbering_plans"("status");

-- CreateIndex
CREATE INDEX "numbering_plans_fraud_risk_idx" ON "numbering_plans"("fraud_risk");

-- CreateIndex
CREATE INDEX "rating_timebands_name_idx" ON "rating_timebands"("name");

-- CreateIndex
CREATE INDEX "rating_timebands_country_code_idx" ON "rating_timebands"("country_code");

-- CreateIndex
CREATE INDEX "rating_timebands_is_active_idx" ON "rating_timebands"("is_active");

-- AddForeignKey
ALTER TABLE "carrier_pricelists" ADD CONSTRAINT "carrier_pricelists_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrier_rates" ADD CONSTRAINT "carrier_rates_pricelist_id_fkey" FOREIGN KEY ("pricelist_id") REFERENCES "carrier_pricelists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_profiles" ADD CONSTRAINT "credit_profiles_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volume_commitments" ADD CONSTRAINT "volume_commitments_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volume_commitments" ADD CONSTRAINT "volume_commitments_discount_scheme_id_fkey" FOREIGN KEY ("discount_scheme_id") REFERENCES "discount_schemes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_tiers" ADD CONSTRAINT "discount_tiers_scheme_id_fkey" FOREIGN KEY ("scheme_id") REFERENCES "discount_schemes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_batches" ADD CONSTRAINT "reconciliation_batches_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_results" ADD CONSTRAINT "reconciliation_results_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "reconciliation_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qos_metrics" ADD CONSTRAINT "qos_metrics_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

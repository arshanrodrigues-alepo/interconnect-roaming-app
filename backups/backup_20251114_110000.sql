--
-- PostgreSQL database dump
--

\restrict DwPUlVXErRPkZwWdBbFKUktTHvAgVYJsZee0yEtaOAlF3OuJ6BapvmCx3EXH1a2

-- Dumped from database version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: arshan
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO arshan;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: arshan
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AgreementStatus; Type: TYPE; Schema: public; Owner: arshan
--

CREATE TYPE public."AgreementStatus" AS ENUM (
    'DRAFT',
    'PENDING',
    'ACTIVE',
    'EXPIRED',
    'TERMINATED'
);


ALTER TYPE public."AgreementStatus" OWNER TO arshan;

--
-- Name: AgreementType; Type: TYPE; Schema: public; Owner: arshan
--

CREATE TYPE public."AgreementType" AS ENUM (
    'INTERCONNECT',
    'ROAMING',
    'BOTH'
);


ALTER TYPE public."AgreementType" OWNER TO arshan;

--
-- Name: AnomalySeverity; Type: TYPE; Schema: public; Owner: arshan
--

CREATE TYPE public."AnomalySeverity" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);


ALTER TYPE public."AnomalySeverity" OWNER TO arshan;

--
-- Name: AnomalyStatus; Type: TYPE; Schema: public; Owner: arshan
--

CREATE TYPE public."AnomalyStatus" AS ENUM (
    'OPEN',
    'INVESTIGATING',
    'RESOLVED',
    'FALSE_POSITIVE'
);


ALTER TYPE public."AnomalyStatus" OWNER TO arshan;

--
-- Name: AnomalyType; Type: TYPE; Schema: public; Owner: arshan
--

CREATE TYPE public."AnomalyType" AS ENUM (
    'UNUSUAL_TRAFFIC_VOLUME',
    'HIGH_COST_DESTINATION',
    'VELOCITY_ANOMALY',
    'SUCCESS_RATE_DROP',
    'UNUSUAL_CALL_DURATION',
    'LATE_NIGHT_TRAFFIC',
    'IRSF_SUSPECTED',
    'SIM_BOX_FRAUD',
    'WANGIRI_FRAUD'
);


ALTER TYPE public."AnomalyType" OWNER TO arshan;

--
-- Name: BillingCycleStatus; Type: TYPE; Schema: public; Owner: arshan
--

CREATE TYPE public."BillingCycleStatus" AS ENUM (
    'OPEN',
    'PROCESSING',
    'INVOICED',
    'CLOSED',
    'DISPUTED',
    'CANCELLED'
);


ALTER TYPE public."BillingCycleStatus" OWNER TO arshan;

--
-- Name: BillingFrequency; Type: TYPE; Schema: public; Owner: arshan
--

CREATE TYPE public."BillingFrequency" AS ENUM (
    'MONTHLY',
    'QUARTERLY',
    'CUSTOM'
);


ALTER TYPE public."BillingFrequency" OWNER TO arshan;

--
-- Name: Direction; Type: TYPE; Schema: public; Owner: arshan
--

CREATE TYPE public."Direction" AS ENUM (
    'INBOUND',
    'OUTBOUND'
);


ALTER TYPE public."Direction" OWNER TO arshan;

--
-- Name: DisputeStatus; Type: TYPE; Schema: public; Owner: arshan
--

CREATE TYPE public."DisputeStatus" AS ENUM (
    'OPEN',
    'IN_REVIEW',
    'RESOLVED',
    'REJECTED',
    'ESCALATED'
);


ALTER TYPE public."DisputeStatus" OWNER TO arshan;

--
-- Name: DisputeType; Type: TYPE; Schema: public; Owner: arshan
--

CREATE TYPE public."DisputeType" AS ENUM (
    'BILLING',
    'TECHNICAL',
    'QUALITY',
    'OTHER'
);


ALTER TYPE public."DisputeType" OWNER TO arshan;

--
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: arshan
--

CREATE TYPE public."InvoiceStatus" AS ENUM (
    'DRAFT',
    'ISSUED',
    'PAID',
    'DISPUTED',
    'CANCELLED',
    'OVERDUE'
);


ALTER TYPE public."InvoiceStatus" OWNER TO arshan;

--
-- Name: PartnerStatus; Type: TYPE; Schema: public; Owner: arshan
--

CREATE TYPE public."PartnerStatus" AS ENUM (
    'PENDING',
    'ACTIVE',
    'SUSPENDED',
    'INACTIVE'
);


ALTER TYPE public."PartnerStatus" OWNER TO arshan;

--
-- Name: PartnerType; Type: TYPE; Schema: public; Owner: arshan
--

CREATE TYPE public."PartnerType" AS ENUM (
    'VENDOR',
    'CUSTOMER',
    'RECIPROCAL'
);


ALTER TYPE public."PartnerType" OWNER TO arshan;

--
-- Name: PolicyDocType; Type: TYPE; Schema: public; Owner: arshan
--

CREATE TYPE public."PolicyDocType" AS ENUM (
    'AGREEMENT_TEMPLATE',
    'SMS_REVENUE_COMMITMENT',
    'TAX_POLICY',
    'CUSTOM'
);


ALTER TYPE public."PolicyDocType" OWNER TO arshan;

--
-- Name: PolicyStatus; Type: TYPE; Schema: public; Owner: arshan
--

CREATE TYPE public."PolicyStatus" AS ENUM (
    'DRAFT',
    'UNDER_REVIEW',
    'APPROVED',
    'ACTIVE'
);


ALTER TYPE public."PolicyStatus" OWNER TO arshan;

--
-- Name: Priority; Type: TYPE; Schema: public; Owner: arshan
--

CREATE TYPE public."Priority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);


ALTER TYPE public."Priority" OWNER TO arshan;

--
-- Name: ProcessingStatus; Type: TYPE; Schema: public; Owner: arshan
--

CREATE TYPE public."ProcessingStatus" AS ENUM (
    'PENDING',
    'RATED',
    'SETTLED',
    'DISPUTED',
    'FAILED'
);


ALTER TYPE public."ProcessingStatus" OWNER TO arshan;

--
-- Name: RoundingRule; Type: TYPE; Schema: public; Owner: arshan
--

CREATE TYPE public."RoundingRule" AS ENUM (
    'UP',
    'DOWN',
    'NEAREST',
    'NONE'
);


ALTER TYPE public."RoundingRule" OWNER TO arshan;

--
-- Name: ServiceType; Type: TYPE; Schema: public; Owner: arshan
--

CREATE TYPE public."ServiceType" AS ENUM (
    'VOICE',
    'SMS',
    'DATA',
    'MMS'
);


ALTER TYPE public."ServiceType" OWNER TO arshan;

--
-- Name: TAPFileStatus; Type: TYPE; Schema: public; Owner: arshan
--

CREATE TYPE public."TAPFileStatus" AS ENUM (
    'UPLOADED',
    'PARSING',
    'PARSED',
    'RATED',
    'ERROR'
);


ALTER TYPE public."TAPFileStatus" OWNER TO arshan;

--
-- Name: TestDirection; Type: TYPE; Schema: public; Owner: arshan
--

CREATE TYPE public."TestDirection" AS ENUM (
    'MO',
    'MT'
);


ALTER TYPE public."TestDirection" OWNER TO arshan;

--
-- Name: TestResult; Type: TYPE; Schema: public; Owner: arshan
--

CREATE TYPE public."TestResult" AS ENUM (
    'SUCCESS',
    'FAILED',
    'PARTIAL'
);


ALTER TYPE public."TestResult" OWNER TO arshan;

--
-- Name: TestStatus; Type: TYPE; Schema: public; Owner: arshan
--

CREATE TYPE public."TestStatus" AS ENUM (
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'FAILED',
    'CANCELLED'
);


ALTER TYPE public."TestStatus" OWNER TO arshan;

--
-- Name: TestType; Type: TYPE; Schema: public; Owner: arshan
--

CREATE TYPE public."TestType" AS ENUM (
    'VOICE_CALL',
    'SMS',
    'DATA_SESSION',
    'VOLTE',
    'VOWIFI',
    'REGISTRATION'
);


ALTER TYPE public."TestType" OWNER TO arshan;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: arshan
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'PARTNER',
    'FINANCE',
    'SUPPORT'
);


ALTER TYPE public."UserRole" OWNER TO arshan;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: arshan
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO arshan;

--
-- Name: agreements; Type: TABLE; Schema: public; Owner: arshan
--

CREATE TABLE public.agreements (
    id uuid NOT NULL,
    partner_id uuid NOT NULL,
    agreement_name character varying(255) NOT NULL,
    agreement_type public."AgreementType" NOT NULL,
    start_date date NOT NULL,
    end_date date,
    status public."AgreementStatus" DEFAULT 'DRAFT'::public."AgreementStatus" NOT NULL,
    policy_status public."PolicyStatus" DEFAULT 'DRAFT'::public."PolicyStatus" NOT NULL,
    document_template text,
    contract_file_url text,
    raex_form_url text,
    currency character varying(3) NOT NULL,
    billing_cycle public."BillingFrequency" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.agreements OWNER TO arshan;

--
-- Name: anomalies; Type: TABLE; Schema: public; Owner: arshan
--

CREATE TABLE public.anomalies (
    id uuid NOT NULL,
    partner_id uuid NOT NULL,
    detected_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    anomaly_type public."AnomalyType" NOT NULL,
    severity public."AnomalySeverity" NOT NULL,
    description text NOT NULL,
    affected_services public."ServiceType"[],
    metrics jsonb NOT NULL,
    status public."AnomalyStatus" DEFAULT 'OPEN'::public."AnomalyStatus" NOT NULL,
    recommended_action text NOT NULL,
    investigated_by_id uuid,
    investigation_notes text,
    resolved_at timestamp(3) without time zone
);


ALTER TABLE public.anomalies OWNER TO arshan;

--
-- Name: billing_cycles; Type: TABLE; Schema: public; Owner: arshan
--

CREATE TABLE public.billing_cycles (
    id uuid NOT NULL,
    partner_id uuid NOT NULL,
    cycle_number integer NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    cut_off_date date NOT NULL,
    due_date date NOT NULL,
    status public."BillingCycleStatus" DEFAULT 'OPEN'::public."BillingCycleStatus" NOT NULL,
    total_tap_files integer DEFAULT 0 NOT NULL,
    total_records integer DEFAULT 0 NOT NULL,
    total_minutes integer DEFAULT 0 NOT NULL,
    total_sms integer DEFAULT 0 NOT NULL,
    total_data_mb numeric(15,2) DEFAULT 0 NOT NULL,
    subtotal numeric(15,4) DEFAULT 0 NOT NULL,
    discounts numeric(15,4) DEFAULT 0 NOT NULL,
    taxes numeric(15,4) DEFAULT 0 NOT NULL,
    total_amount numeric(15,4) DEFAULT 0 NOT NULL,
    currency character varying(3) DEFAULT 'USD'::character varying NOT NULL,
    invoice_id uuid,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    closed_at timestamp(3) without time zone,
    closed_by uuid
);


ALTER TABLE public.billing_cycles OWNER TO arshan;

--
-- Name: disputes; Type: TABLE; Schema: public; Owner: arshan
--

CREATE TABLE public.disputes (
    id uuid NOT NULL,
    dispute_number character varying(50) NOT NULL,
    invoice_id uuid,
    partner_id uuid NOT NULL,
    dispute_type public."DisputeType" NOT NULL,
    status public."DisputeStatus" DEFAULT 'OPEN'::public."DisputeStatus" NOT NULL,
    priority public."Priority" DEFAULT 'MEDIUM'::public."Priority" NOT NULL,
    description text NOT NULL,
    disputed_amount numeric(15,2),
    resolution text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    resolved_at timestamp(3) without time zone,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by_id uuid,
    assigned_to_id uuid
);


ALTER TABLE public.disputes OWNER TO arshan;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: arshan
--

CREATE TABLE public.invoices (
    id uuid NOT NULL,
    invoice_number character varying(50) NOT NULL,
    partner_id uuid NOT NULL,
    billing_period_start date NOT NULL,
    billing_period_end date NOT NULL,
    subtotal numeric(15,2) NOT NULL,
    tax_amount numeric(15,2) DEFAULT 0 NOT NULL,
    total_amount numeric(15,2) NOT NULL,
    currency character varying(3) NOT NULL,
    status public."InvoiceStatus" DEFAULT 'DRAFT'::public."InvoiceStatus" NOT NULL,
    invoice_date date NOT NULL,
    due_date date,
    paid_date date,
    pdf_url text,
    notes text,
    line_items jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.invoices OWNER TO arshan;

--
-- Name: partners; Type: TABLE; Schema: public; Owner: arshan
--

CREATE TABLE public.partners (
    id uuid NOT NULL,
    partner_code character varying(20) NOT NULL,
    partner_name character varying(255) NOT NULL,
    partner_type public."PartnerType" NOT NULL,
    country_code character varying(3) NOT NULL,
    status public."PartnerStatus" DEFAULT 'PENDING'::public."PartnerStatus" NOT NULL,
    contact_email character varying(255) NOT NULL,
    contact_phone character varying(20),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.partners OWNER TO arshan;

--
-- Name: policy_documents; Type: TABLE; Schema: public; Owner: arshan
--

CREATE TABLE public.policy_documents (
    id uuid NOT NULL,
    policy_type public."PolicyDocType" NOT NULL,
    policy_name character varying(255) NOT NULL,
    content text NOT NULL,
    version character varying(20) NOT NULL,
    status public."PolicyStatus" DEFAULT 'DRAFT'::public."PolicyStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by character varying(255)
);


ALTER TABLE public.policy_documents OWNER TO arshan;

--
-- Name: raex_forms; Type: TABLE; Schema: public; Owner: arshan
--

CREATE TABLE public.raex_forms (
    id uuid NOT NULL,
    agreement_id uuid NOT NULL,
    network_name character varying(255) NOT NULL,
    tadig_code character varying(20) NOT NULL,
    mcc character varying(3) NOT NULL,
    mnc character varying(3) NOT NULL,
    supported_technologies text[],
    volte_capable boolean DEFAULT false NOT NULL,
    vowifi_capable boolean DEFAULT false NOT NULL,
    rcs_capable boolean DEFAULT false NOT NULL,
    sccp_address character varying(50),
    diameter_endpoint character varying(255),
    tap_version character varying(10) NOT NULL,
    file_exchange_protocol character varying(20) NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.raex_forms OWNER TO arshan;

--
-- Name: rate_plans; Type: TABLE; Schema: public; Owner: arshan
--

CREATE TABLE public.rate_plans (
    id uuid NOT NULL,
    agreement_id uuid NOT NULL,
    service_type public."ServiceType" NOT NULL,
    direction public."Direction" NOT NULL,
    rate_per_unit numeric(10,6) NOT NULL,
    currency character varying(3) NOT NULL,
    effective_from date NOT NULL,
    effective_to date,
    rounding_rule public."RoundingRule" NOT NULL,
    minimum_charge numeric(10,6),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.rate_plans OWNER TO arshan;

--
-- Name: rate_sheets; Type: TABLE; Schema: public; Owner: arshan
--

CREATE TABLE public.rate_sheets (
    id uuid NOT NULL,
    partner_id uuid NOT NULL,
    rate_sheet_name character varying(255) NOT NULL,
    effective_date date NOT NULL,
    expiry_date date,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.rate_sheets OWNER TO arshan;

--
-- Name: rates; Type: TABLE; Schema: public; Owner: arshan
--

CREATE TABLE public.rates (
    id uuid NOT NULL,
    rate_sheet_id uuid NOT NULL,
    service_type public."ServiceType" NOT NULL,
    direction public."Direction" NOT NULL,
    called_number_prefix character varying(20),
    call_type character varying(50),
    rate_per_unit numeric(10,6) NOT NULL,
    currency character varying(3) NOT NULL,
    minimum_charge numeric(10,6),
    rounding_rule public."RoundingRule" NOT NULL,
    tier_start integer,
    tier_end integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.rates OWNER TO arshan;

--
-- Name: tap_files; Type: TABLE; Schema: public; Owner: arshan
--

CREATE TABLE public.tap_files (
    id uuid NOT NULL,
    partner_id uuid NOT NULL,
    filename character varying(255) NOT NULL,
    file_size_bytes bigint NOT NULL,
    direction public."Direction" NOT NULL,
    status public."TAPFileStatus" DEFAULT 'UPLOADED'::public."TAPFileStatus" NOT NULL,
    upload_timestamp timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    processed_timestamp timestamp(3) without time zone,
    records_count integer,
    total_charges numeric(15,2),
    error_message text
);


ALTER TABLE public.tap_files OWNER TO arshan;

--
-- Name: tap_records; Type: TABLE; Schema: public; Owner: arshan
--

CREATE TABLE public.tap_records (
    id uuid NOT NULL,
    tap_file_id uuid NOT NULL,
    partner_id uuid NOT NULL,
    service_type public."ServiceType" NOT NULL,
    call_date_time timestamp(3) without time zone NOT NULL,
    msisdn character varying(20) NOT NULL,
    imsi character varying(15),
    calling_number character varying(20),
    called_number character varying(20),
    duration_seconds integer,
    data_volume_mb numeric(10,2),
    message_count integer,
    charged_amount numeric(10,6),
    currency character varying(3),
    processing_status public."ProcessingStatus" DEFAULT 'PENDING'::public."ProcessingStatus" NOT NULL,
    error_message text,
    raw_tap_data jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tap_records OWNER TO arshan;

--
-- Name: test_calls; Type: TABLE; Schema: public; Owner: arshan
--

CREATE TABLE public.test_calls (
    id uuid NOT NULL,
    partner_id uuid NOT NULL,
    test_type public."TestType" NOT NULL,
    direction public."TestDirection" NOT NULL,
    source_msisdn character varying(20) NOT NULL,
    destination_msisdn character varying(20) NOT NULL,
    scheduled_time timestamp(3) without time zone NOT NULL,
    executed_at timestamp(3) without time zone,
    status public."TestStatus" DEFAULT 'SCHEDULED'::public."TestStatus" NOT NULL,
    result public."TestResult",
    quality_metrics jsonb,
    details jsonb,
    error_message text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.test_calls OWNER TO arshan;

--
-- Name: users; Type: TABLE; Schema: public; Owner: arshan
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    role public."UserRole" NOT NULL,
    partner_id uuid,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    last_login timestamp(3) without time zone
);


ALTER TABLE public.users OWNER TO arshan;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: arshan
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
\.


--
-- Data for Name: agreements; Type: TABLE DATA; Schema: public; Owner: arshan
--

COPY public.agreements (id, partner_id, agreement_name, agreement_type, start_date, end_date, status, policy_status, document_template, contract_file_url, raex_form_url, currency, billing_cycle, created_at, updated_at) FROM stdin;
f829b10a-f871-4169-ba6e-65f8c49fcc4a	530ffbbc-e322-4f37-899a-940cf6a7df79	Verizon Interconnect & Roaming Agreement 2025	BOTH	2025-01-01	\N	ACTIVE	ACTIVE	Master Interconnect Agreement...	\N	\N	USD	MONTHLY	2025-11-14 08:34:26.176	2025-11-14 08:34:26.176
62a8351b-0789-4f2c-a9e9-8ddd87fa9c1e	4460cd9b-276e-4523-87a3-0a15aadcefed	T-Mobile UK Roaming Agreement	ROAMING	2024-06-01	\N	ACTIVE	ACTIVE	\N	\N	\N	GBP	MONTHLY	2025-11-14 08:34:26.179	2025-11-14 08:34:26.179
17fa93ba-becb-4b1d-91bb-628dc0360c14	6684167a-674e-46be-9c10-818fa5189429	NTT Docomo Interconnect Agreement	INTERCONNECT	2024-12-01	\N	ACTIVE	APPROVED	\N	\N	\N	JPY	MONTHLY	2025-11-14 08:34:26.181	2025-11-14 08:34:26.181
\.


--
-- Data for Name: anomalies; Type: TABLE DATA; Schema: public; Owner: arshan
--

COPY public.anomalies (id, partner_id, detected_at, anomaly_type, severity, description, affected_services, metrics, status, recommended_action, investigated_by_id, investigation_notes, resolved_at) FROM stdin;
929ff2ee-690c-4cde-a317-d13acd40a71e	530ffbbc-e322-4f37-899a-940cf6a7df79	2025-11-14 08:34:26.215	UNUSUAL_TRAFFIC_VOLUME	HIGH	Traffic spike of 350% detected for SMS services	{SMS}	{"normalVolume": 5000, "detectedVolume": 17500, "percentageIncrease": 250}	OPEN	Review traffic patterns and contact partner	442c3ab9-5671-40f1-81f4-1f6f04230caf	\N	\N
95894faa-5fa6-40e9-8807-ff7e4f88bb1a	4460cd9b-276e-4523-87a3-0a15aadcefed	2025-11-14 08:34:26.219	HIGH_COST_DESTINATION	CRITICAL	Unusual calls to premium rate destinations detected	{VOICE}	{"callCount": 127, "estimatedCost": 4500, "destinationPrefix": "+248"}	INVESTIGATING	Block premium rate destinations immediately	442c3ab9-5671-40f1-81f4-1f6f04230caf	Coordinating with partner security team	\N
\.


--
-- Data for Name: billing_cycles; Type: TABLE DATA; Schema: public; Owner: arshan
--

COPY public.billing_cycles (id, partner_id, cycle_number, period_start, period_end, cut_off_date, due_date, status, total_tap_files, total_records, total_minutes, total_sms, total_data_mb, subtotal, discounts, taxes, total_amount, currency, invoice_id, notes, created_at, updated_at, closed_at, closed_by) FROM stdin;
cbad2196-3e12-44ba-a292-56fd243d5bf5	530ffbbc-e322-4f37-899a-940cf6a7df79	1	2025-01-01	2025-01-31	2025-02-05	2025-03-02	OPEN	0	0	0	0	0.00	0.0000	0.0000	0.0000	0.0000	USD	\N	\N	2025-11-14 08:51:52.263	2025-11-14 08:51:52.263	\N	\N
5034c075-ec3e-4226-b00f-cdf3c7746395	6684167a-674e-46be-9c10-818fa5189429	1	2024-11-01	2024-11-30	2024-12-05	2025-01-04	INVOICED	0	0	89245	23456	67890.00	456789.0000	0.0000	0.0000	456789.0000	JPY	\N	\N	2025-11-14 08:51:52.271	2025-11-14 08:51:52.271	2024-12-05 00:00:00	\N
2a6bf3ca-3564-4775-a607-e54ad6a67b34	530ffbbc-e322-4f37-899a-940cf6a7df79	2	2025-02-01	2025-02-28	2025-03-05	2025-04-01	OPEN	0	0	0	0	0.00	0.0000	0.0000	0.0000	0.0000	USD	\N	\N	2025-11-14 08:51:52.273	2025-11-14 08:51:52.273	\N	\N
1253f3ae-bca5-4453-86f3-6e1b8fa316c4	530ffbbc-e322-4f37-899a-940cf6a7df79	3	2025-12-01	2025-12-31	2026-01-05	2026-01-30	OPEN	0	0	0	0	0.00	0.0000	0.0000	0.0000	0.0000	USD	\N	\N	2025-11-14 09:04:04.99	2025-11-14 09:04:04.99	\N	\N
6ddf8122-584c-45a1-a4c6-7c8a4109819b	4460cd9b-276e-4523-87a3-0a15aadcefed	2	2025-12-01	2025-12-31	2026-01-05	2026-01-30	OPEN	0	0	0	0	0.00	0.0000	0.0000	0.0000	0.0000	GBP	\N	\N	2025-11-14 09:04:05	2025-11-14 09:04:05	\N	\N
b6910c83-fbfa-4468-a79c-1925f6352971	6684167a-674e-46be-9c10-818fa5189429	2	2025-12-01	2025-12-31	2026-01-05	2026-01-30	OPEN	0	0	0	0	0.00	0.0000	0.0000	0.0000	0.0000	JPY	\N	\N	2025-11-14 09:04:05.008	2025-11-14 09:04:05.008	\N	\N
bd31ce74-1f6c-4ab5-adff-5ecd2c1cf005	4460cd9b-276e-4523-87a3-0a15aadcefed	1	2024-12-01	2024-12-31	2025-01-05	2025-01-30	INVOICED	0	0	125430	45678	98234.00	12543.5000	0.0000	0.0000	12543.5000	GBP	94c6d9eb-75a6-4593-af15-5f36fa25097e	\N	2025-11-14 08:51:52.268	2025-11-14 10:33:00.054	2025-01-05 00:00:00	\N
e8389883-94ab-40ff-8d27-9d80d26e4c5f	530ffbbc-e322-4f37-899a-940cf6a7df79	4	2025-11-15	2026-01-14	2026-01-16	2026-01-30	OPEN	0	0	0	0	0.00	0.0000	0.0000	0.0000	0.0000	USD	\N	\N	2025-11-14 10:35:11.348	2025-11-14 10:35:11.348	\N	\N
\.


--
-- Data for Name: disputes; Type: TABLE DATA; Schema: public; Owner: arshan
--

COPY public.disputes (id, dispute_number, invoice_id, partner_id, dispute_type, status, priority, description, disputed_amount, resolution, created_at, resolved_at, updated_at, created_by_id, assigned_to_id) FROM stdin;
726cb0a2-02bf-4ff6-9a6d-0428f8eb3d3b	DSP-2025-001	216ae72a-e496-49ce-90cd-fe3da0c1a594	530ffbbc-e322-4f37-899a-940cf6a7df79	BILLING	OPEN	HIGH	Discrepancy in voice call charges for 2025-01 period	250.00	\N	2025-11-14 08:34:26.211	\N	2025-11-14 08:34:26.211	a594f473-5c5c-4df0-91af-25c511edf908	839f19a3-3b48-4702-af0b-8a8658954728
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: arshan
--

COPY public.invoices (id, invoice_number, partner_id, billing_period_start, billing_period_end, subtotal, tax_amount, total_amount, currency, status, invoice_date, due_date, paid_date, pdf_url, notes, line_items, created_at, updated_at) FROM stdin;
216ae72a-e496-49ce-90cd-fe3da0c1a594	INV-2025-001	530ffbbc-e322-4f37-899a-940cf6a7df79	2025-01-01	2025-01-31	12543.50	1254.35	13797.85	USD	ISSUED	2025-02-01	2025-03-03	\N	\N	\N	[{"rate": 0.025, "amount": 3135.75, "direction": "INBOUND", "totalUnits": 125430, "serviceType": "VOICE"}, {"rate": 0.03, "amount": 2947.35, "direction": "OUTBOUND", "totalUnits": 98245, "serviceType": "VOICE"}, {"rate": 0.005, "amount": 228.39, "direction": "INBOUND", "totalUnits": 45678, "serviceType": "SMS"}]	2025-11-14 08:34:26.202	2025-11-14 08:34:26.202
7024e0b1-62c1-4bf1-9470-e1092a37dc7f	INV-2025-002	4460cd9b-276e-4523-87a3-0a15aadcefed	2025-01-01	2025-01-31	8745.20	1749.04	10494.24	GBP	PAID	2025-02-01	2025-03-03	2025-02-15	\N	\N	\N	2025-11-14 08:34:26.208	2025-11-14 08:34:26.208
94c6d9eb-75a6-4593-af15-5f36fa25097e	INV-2025-003	4460cd9b-276e-4523-87a3-0a15aadcefed	2024-12-01	2024-12-31	0.00	0.00	0.00	GBP	DRAFT	2025-11-14	2025-01-30	\N	\N	\N	[]	2025-11-14 10:33:00.042	2025-11-14 10:33:00.042
\.


--
-- Data for Name: partners; Type: TABLE DATA; Schema: public; Owner: arshan
--

COPY public.partners (id, partner_code, partner_name, partner_type, country_code, status, contact_email, contact_phone, created_at, updated_at) FROM stdin;
530ffbbc-e322-4f37-899a-940cf6a7df79	USAVZ1	Verizon Wireless	RECIPROCAL	USA	ACTIVE	roaming@verizon.com	+1-555-0100	2025-11-14 08:34:26.002	2025-11-14 08:34:26.002
4460cd9b-276e-4523-87a3-0a15aadcefed	GBRTM1	T-Mobile UK	RECIPROCAL	GBR	ACTIVE	wholesale@tmobile.uk	+44-20-7946-0958	2025-11-14 08:34:26.006	2025-11-14 08:34:26.006
fcba71f9-9480-41c3-8393-d525f5b01aac	DEUTE1	Deutsche Telekom	RECIPROCAL	DEU	PENDING	roaming@telekom.de	+49-30-1234567	2025-11-14 08:34:26.007	2025-11-14 08:34:26.007
6684167a-674e-46be-9c10-818fa5189429	JPNDO1	NTT Docomo	RECIPROCAL	JPN	ACTIVE	intl@nttdocomo.jp	\N	2025-11-14 08:34:26.009	2025-11-14 08:34:26.009
b8609236-bf41-4e25-9d9e-8763122b4edc	FRAVF1	Vodafone France	VENDOR	FRA	SUSPENDED	roaming@vodafone.fr	+33-1-2345-6789	2025-11-14 08:34:26.01	2025-11-14 08:34:26.01
\.


--
-- Data for Name: policy_documents; Type: TABLE DATA; Schema: public; Owner: arshan
--

COPY public.policy_documents (id, policy_type, policy_name, content, version, status, created_at, updated_at, created_by) FROM stdin;
f085752f-b8a5-4d64-8be1-973912b552c6	AGREEMENT_TEMPLATE	Master Interconnect Agreement Template	# Master Interconnect Agreement\n\nThis agreement is entered into...	1.0	ACTIVE	2025-11-14 08:34:26.228	2025-11-14 08:34:26.228	System
\.


--
-- Data for Name: raex_forms; Type: TABLE DATA; Schema: public; Owner: arshan
--

COPY public.raex_forms (id, agreement_id, network_name, tadig_code, mcc, mnc, supported_technologies, volte_capable, vowifi_capable, rcs_capable, sccp_address, diameter_endpoint, tap_version, file_exchange_protocol, created_at, updated_at) FROM stdin;
0b2e9242-6fd3-4411-b535-be3a738f3db7	f829b10a-f871-4169-ba6e-65f8c49fcc4a	Verizon Wireless	USAVZ1	310	012	{4G,5G}	t	t	f	1234567890123	diameter.verizon.com:3868	3.12	SFTP	2025-11-14 08:34:26.222	2025-11-14 08:34:26.222
\.


--
-- Data for Name: rate_plans; Type: TABLE DATA; Schema: public; Owner: arshan
--

COPY public.rate_plans (id, agreement_id, service_type, direction, rate_per_unit, currency, effective_from, effective_to, rounding_rule, minimum_charge, created_at) FROM stdin;
\.


--
-- Data for Name: rate_sheets; Type: TABLE DATA; Schema: public; Owner: arshan
--

COPY public.rate_sheets (id, partner_id, rate_sheet_name, effective_date, expiry_date, is_active, created_at, updated_at) FROM stdin;
0f314285-1f37-4688-acf5-536d58375ac4	530ffbbc-e322-4f37-899a-940cf6a7df79	Verizon 2025 Rate Card	2025-01-01	\N	t	2025-11-14 08:34:26.183	2025-11-14 08:34:26.183
ffbd9b71-6c0d-4fb8-8201-4c6bb7725524	4460cd9b-276e-4523-87a3-0a15aadcefed	T-Mobile UK 2025 Rates	2025-01-01	\N	t	2025-11-14 08:34:26.189	2025-11-14 08:34:26.189
38f854b8-078c-4fc0-9ff6-a683bf4fe2c2	6684167a-674e-46be-9c10-818fa5189429	Docomo 2025 Pricing	2025-01-01	\N	t	2025-11-14 08:34:26.192	2025-11-14 08:34:26.192
\.


--
-- Data for Name: rates; Type: TABLE DATA; Schema: public; Owner: arshan
--

COPY public.rates (id, rate_sheet_id, service_type, direction, called_number_prefix, call_type, rate_per_unit, currency, minimum_charge, rounding_rule, tier_start, tier_end, created_at) FROM stdin;
d86fea38-e060-49eb-86c0-c70a2b926e0d	0f314285-1f37-4688-acf5-536d58375ac4	VOICE	INBOUND	+1	\N	0.025000	USD	0.010000	UP	\N	\N	2025-11-14 08:34:26.183
076ef221-519a-4030-b421-1221df903500	0f314285-1f37-4688-acf5-536d58375ac4	VOICE	OUTBOUND	+1	\N	0.030000	USD	0.010000	UP	\N	\N	2025-11-14 08:34:26.183
7183d961-8bb3-4ebd-8adf-48bbd10bccd8	0f314285-1f37-4688-acf5-536d58375ac4	SMS	INBOUND	\N	\N	0.005000	USD	\N	NONE	\N	\N	2025-11-14 08:34:26.183
f726b2d2-8da4-4d71-be98-73cbcf8e4918	0f314285-1f37-4688-acf5-536d58375ac4	SMS	OUTBOUND	\N	\N	0.008000	USD	\N	NONE	\N	\N	2025-11-14 08:34:26.183
c6bece85-1a49-48fc-9d1e-8e3d449fcab6	ffbd9b71-6c0d-4fb8-8201-4c6bb7725524	VOICE	INBOUND	+44	\N	0.020000	GBP	0.010000	UP	\N	\N	2025-11-14 08:34:26.189
483eae48-fb53-4dc0-a0ec-7af1b9a5b0d0	ffbd9b71-6c0d-4fb8-8201-4c6bb7725524	VOICE	OUTBOUND	+44	\N	0.025000	GBP	0.010000	UP	\N	\N	2025-11-14 08:34:26.189
d1d8aa0a-16f2-4b33-af22-b8eacfd78d19	ffbd9b71-6c0d-4fb8-8201-4c6bb7725524	SMS	INBOUND	\N	\N	0.004000	GBP	\N	NONE	\N	\N	2025-11-14 08:34:26.189
57648a34-dc2b-4281-8892-dba72d42780b	ffbd9b71-6c0d-4fb8-8201-4c6bb7725524	SMS	OUTBOUND	\N	\N	0.006000	GBP	\N	NONE	\N	\N	2025-11-14 08:34:26.189
a0ac3c9d-1545-4915-9939-1f269481c343	38f854b8-078c-4fc0-9ff6-a683bf4fe2c2	VOICE	INBOUND	+81	\N	3.500000	JPY	1.000000	NEAREST	\N	\N	2025-11-14 08:34:26.192
f16fa577-9fdd-4c95-b193-372a9f42d7b5	38f854b8-078c-4fc0-9ff6-a683bf4fe2c2	SMS	INBOUND	\N	\N	0.500000	JPY	\N	NONE	\N	\N	2025-11-14 08:34:26.192
\.


--
-- Data for Name: tap_files; Type: TABLE DATA; Schema: public; Owner: arshan
--

COPY public.tap_files (id, partner_id, filename, file_size_bytes, direction, status, upload_timestamp, processed_timestamp, records_count, total_charges, error_message) FROM stdin;
8185e238-8c8a-4d25-83f6-b1d103fcb60b	530ffbbc-e322-4f37-899a-940cf6a7df79	USAVZ1_202501_001.TAP	524288	INBOUND	RATED	2025-11-14 08:34:26.197	2025-11-14 08:34:26.195	150	45.75	\N
00051da1-6c2f-48ed-a166-9eef512b7c4f	4460cd9b-276e-4523-87a3-0a15aadcefed	GBRTM1_202501_001.TAP	312421	OUTBOUND	RATED	2025-11-14 08:34:26.2	2025-11-14 08:34:26.2	89	28.30	\N
45c54e9e-0276-4554-a65b-65dc1fbeb51a	530ffbbc-e322-4f37-899a-940cf6a7df79	Verizon-tap-mixed.json	1194	INBOUND	RATED	2025-11-14 10:18:31.592	2025-11-14 10:18:31.633	5	15.02	\N
\.


--
-- Data for Name: tap_records; Type: TABLE DATA; Schema: public; Owner: arshan
--

COPY public.tap_records (id, tap_file_id, partner_id, service_type, call_date_time, msisdn, imsi, calling_number, called_number, duration_seconds, data_volume_mb, message_count, charged_amount, currency, processing_status, error_message, raw_tap_data, created_at) FROM stdin;
6bcdca54-fb1b-443b-b4cf-aec7d8569f23	45c54e9e-0276-4554-a65b-65dc1fbeb51a	530ffbbc-e322-4f37-899a-940cf6a7df79	VOICE	2025-01-15 10:30:00	+14155551234	310260123456789	+14155551234	+442071234567	125	\N	\N	4.500000	USD	RATED	\N	{"imsi": "310260123456789", "duration": 125, "call_type": "VOICE", "partner_id": "GBRTM1", "called_number": "+442071234567", "calling_number": "+14155551234", "event_date_time": "2025-01-15T10:30:00Z"}	2025-11-14 10:18:31.62
415f1856-c7f7-4292-9bf7-474e8e8d9e6c	45c54e9e-0276-4554-a65b-65dc1fbeb51a	530ffbbc-e322-4f37-899a-940cf6a7df79	SMS	2025-01-15 10:35:00	+14155551235	310260123456790	+14155551235	+442071234568	\N	\N	1	0.005000	USD	RATED	\N	{"imsi": "310260123456790", "call_type": "SMS", "partner_id": "GBRTM1", "called_number": "+442071234568", "calling_number": "+14155551235", "event_date_time": "2025-01-15T10:35:00Z", "number_of_events": 1}	2025-11-14 10:18:31.62
c5b39fb6-7a7e-4d0b-8b64-b491a3517441	45c54e9e-0276-4554-a65b-65dc1fbeb51a	530ffbbc-e322-4f37-899a-940cf6a7df79	VOICE	2025-01-15 10:40:00	+14155551236	310260123456791	+14155551236	+14155559999	245	\N	\N	7.500000	USD	RATED	\N	{"imsi": "310260123456791", "duration": 245, "call_type": "VOICE", "partner_id": "USAVZ1", "called_number": "+14155559999", "calling_number": "+14155551236", "event_date_time": "2025-01-15T10:40:00Z"}	2025-11-14 10:18:31.62
6c7f8be3-0b98-4410-9ca6-fc9b4e406093	45c54e9e-0276-4554-a65b-65dc1fbeb51a	530ffbbc-e322-4f37-899a-940cf6a7df79	SMS	2025-01-15 10:45:00	+14155551237	310260123456792	+14155551237	+819012345678	\N	\N	2	0.010000	USD	RATED	\N	{"imsi": "310260123456792", "call_type": "SMS", "partner_id": "JPNDO1", "called_number": "+819012345678", "calling_number": "+14155551237", "event_date_time": "2025-01-15T10:45:00Z", "number_of_events": 2}	2025-11-14 10:18:31.62
ccca80cc-ec02-4567-951c-054f37d1d1ed	45c54e9e-0276-4554-a65b-65dc1fbeb51a	530ffbbc-e322-4f37-899a-940cf6a7df79	VOICE	2025-01-15 10:50:00	+14155551238	310260123456793	+14155551238	+442071234569	98	\N	\N	3.000000	USD	RATED	\N	{"imsi": "310260123456793", "duration": 98, "call_type": "VOICE", "partner_id": "FRAVF1", "called_number": "+442071234569", "calling_number": "+14155551238", "event_date_time": "2025-01-15T10:50:00Z"}	2025-11-14 10:18:31.62
\.


--
-- Data for Name: test_calls; Type: TABLE DATA; Schema: public; Owner: arshan
--

COPY public.test_calls (id, partner_id, test_type, direction, source_msisdn, destination_msisdn, scheduled_time, executed_at, status, result, quality_metrics, details, error_message, created_at) FROM stdin;
dabfbaba-94ca-44d6-9c2b-d0d2c44b03a4	530ffbbc-e322-4f37-899a-940cf6a7df79	VOICE_CALL	MO	+447700900123	+14155551234	2025-01-16 10:00:00	2025-01-16 10:00:15	COMPLETED	SUCCESS	{"jitterMs": 15, "mosScore": 4.2, "latencyMs": 120, "packetLossPercentage": 0.5}	{"callSetupTimeMs": 2500, "ringTimeSeconds": 3, "conversationTimeSeconds": 40}	\N	2025-11-14 08:34:26.225
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: arshan
--

COPY public.users (id, email, password, name, role, partner_id, created_at, updated_at, last_login) FROM stdin;
dad06818-872b-40b7-98b9-f691cdfedc25	admin@interconnect.local	$2b$10$rxv98Z7p1QGNJEApU3onmuSM1lvZZDo.qqUWAIOVcGY9BGPRyE55C	System Administrator	ADMIN	\N	2025-11-14 08:34:26.163	2025-11-14 08:34:26.163	\N
839f19a3-3b48-4702-af0b-8a8658954728	finance@interconnect.local	$2b$10$rxv98Z7p1QGNJEApU3onmuSM1lvZZDo.qqUWAIOVcGY9BGPRyE55C	Finance Manager	FINANCE	\N	2025-11-14 08:34:26.166	2025-11-14 08:34:26.166	\N
442c3ab9-5671-40f1-81f4-1f6f04230caf	support@interconnect.local	$2b$10$rxv98Z7p1QGNJEApU3onmuSM1lvZZDo.qqUWAIOVcGY9BGPRyE55C	Support Agent	SUPPORT	\N	2025-11-14 08:34:26.167	2025-11-14 08:34:26.167	\N
a594f473-5c5c-4df0-91af-25c511edf908	contact@verizon.com	$2b$10$rxv98Z7p1QGNJEApU3onmuSM1lvZZDo.qqUWAIOVcGY9BGPRyE55C	Verizon Contact	PARTNER	530ffbbc-e322-4f37-899a-940cf6a7df79	2025-11-14 08:34:26.168	2025-11-14 08:34:26.168	\N
4db81200-7977-4047-aea4-3ae65fa84dbd	contact@tmobile.uk	$2b$10$rxv98Z7p1QGNJEApU3onmuSM1lvZZDo.qqUWAIOVcGY9BGPRyE55C	T-Mobile Contact	PARTNER	4460cd9b-276e-4523-87a3-0a15aadcefed	2025-11-14 08:34:26.171	2025-11-14 08:34:26.171	\N
b6bc924e-c003-40ca-b37c-9e9a5b3a2001	contact@docomo.jp	$2b$10$rxv98Z7p1QGNJEApU3onmuSM1lvZZDo.qqUWAIOVcGY9BGPRyE55C	Docomo Contact	PARTNER	6684167a-674e-46be-9c10-818fa5189429	2025-11-14 08:34:26.173	2025-11-14 08:34:26.173	\N
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: agreements agreements_pkey; Type: CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.agreements
    ADD CONSTRAINT agreements_pkey PRIMARY KEY (id);


--
-- Name: anomalies anomalies_pkey; Type: CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.anomalies
    ADD CONSTRAINT anomalies_pkey PRIMARY KEY (id);


--
-- Name: billing_cycles billing_cycles_pkey; Type: CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.billing_cycles
    ADD CONSTRAINT billing_cycles_pkey PRIMARY KEY (id);


--
-- Name: disputes disputes_pkey; Type: CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: partners partners_pkey; Type: CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_pkey PRIMARY KEY (id);


--
-- Name: policy_documents policy_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.policy_documents
    ADD CONSTRAINT policy_documents_pkey PRIMARY KEY (id);


--
-- Name: raex_forms raex_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.raex_forms
    ADD CONSTRAINT raex_forms_pkey PRIMARY KEY (id);


--
-- Name: rate_plans rate_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.rate_plans
    ADD CONSTRAINT rate_plans_pkey PRIMARY KEY (id);


--
-- Name: rate_sheets rate_sheets_pkey; Type: CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.rate_sheets
    ADD CONSTRAINT rate_sheets_pkey PRIMARY KEY (id);


--
-- Name: rates rates_pkey; Type: CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.rates
    ADD CONSTRAINT rates_pkey PRIMARY KEY (id);


--
-- Name: tap_files tap_files_pkey; Type: CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.tap_files
    ADD CONSTRAINT tap_files_pkey PRIMARY KEY (id);


--
-- Name: tap_records tap_records_pkey; Type: CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.tap_records
    ADD CONSTRAINT tap_records_pkey PRIMARY KEY (id);


--
-- Name: test_calls test_calls_pkey; Type: CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.test_calls
    ADD CONSTRAINT test_calls_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: agreements_partner_id_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX agreements_partner_id_idx ON public.agreements USING btree (partner_id);


--
-- Name: agreements_status_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX agreements_status_idx ON public.agreements USING btree (status);


--
-- Name: anomalies_detected_at_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX anomalies_detected_at_idx ON public.anomalies USING btree (detected_at);


--
-- Name: anomalies_partner_id_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX anomalies_partner_id_idx ON public.anomalies USING btree (partner_id);


--
-- Name: anomalies_severity_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX anomalies_severity_idx ON public.anomalies USING btree (severity);


--
-- Name: anomalies_status_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX anomalies_status_idx ON public.anomalies USING btree (status);


--
-- Name: billing_cycles_cycle_number_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX billing_cycles_cycle_number_idx ON public.billing_cycles USING btree (cycle_number);


--
-- Name: billing_cycles_invoice_id_key; Type: INDEX; Schema: public; Owner: arshan
--

CREATE UNIQUE INDEX billing_cycles_invoice_id_key ON public.billing_cycles USING btree (invoice_id);


--
-- Name: billing_cycles_partner_id_cycle_number_key; Type: INDEX; Schema: public; Owner: arshan
--

CREATE UNIQUE INDEX billing_cycles_partner_id_cycle_number_key ON public.billing_cycles USING btree (partner_id, cycle_number);


--
-- Name: billing_cycles_partner_id_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX billing_cycles_partner_id_idx ON public.billing_cycles USING btree (partner_id);


--
-- Name: billing_cycles_period_start_period_end_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX billing_cycles_period_start_period_end_idx ON public.billing_cycles USING btree (period_start, period_end);


--
-- Name: billing_cycles_status_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX billing_cycles_status_idx ON public.billing_cycles USING btree (status);


--
-- Name: disputes_created_at_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX disputes_created_at_idx ON public.disputes USING btree (created_at);


--
-- Name: disputes_dispute_number_key; Type: INDEX; Schema: public; Owner: arshan
--

CREATE UNIQUE INDEX disputes_dispute_number_key ON public.disputes USING btree (dispute_number);


--
-- Name: disputes_partner_id_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX disputes_partner_id_idx ON public.disputes USING btree (partner_id);


--
-- Name: disputes_priority_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX disputes_priority_idx ON public.disputes USING btree (priority);


--
-- Name: disputes_status_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX disputes_status_idx ON public.disputes USING btree (status);


--
-- Name: invoices_due_date_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX invoices_due_date_idx ON public.invoices USING btree (due_date);


--
-- Name: invoices_invoice_date_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX invoices_invoice_date_idx ON public.invoices USING btree (invoice_date);


--
-- Name: invoices_invoice_number_key; Type: INDEX; Schema: public; Owner: arshan
--

CREATE UNIQUE INDEX invoices_invoice_number_key ON public.invoices USING btree (invoice_number);


--
-- Name: invoices_partner_id_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX invoices_partner_id_idx ON public.invoices USING btree (partner_id);


--
-- Name: invoices_status_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX invoices_status_idx ON public.invoices USING btree (status);


--
-- Name: partners_country_code_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX partners_country_code_idx ON public.partners USING btree (country_code);


--
-- Name: partners_partner_code_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX partners_partner_code_idx ON public.partners USING btree (partner_code);


--
-- Name: partners_partner_code_key; Type: INDEX; Schema: public; Owner: arshan
--

CREATE UNIQUE INDEX partners_partner_code_key ON public.partners USING btree (partner_code);


--
-- Name: partners_status_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX partners_status_idx ON public.partners USING btree (status);


--
-- Name: policy_documents_policy_type_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX policy_documents_policy_type_idx ON public.policy_documents USING btree (policy_type);


--
-- Name: policy_documents_status_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX policy_documents_status_idx ON public.policy_documents USING btree (status);


--
-- Name: raex_forms_agreement_id_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX raex_forms_agreement_id_idx ON public.raex_forms USING btree (agreement_id);


--
-- Name: raex_forms_tadig_code_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX raex_forms_tadig_code_idx ON public.raex_forms USING btree (tadig_code);


--
-- Name: rate_plans_agreement_id_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX rate_plans_agreement_id_idx ON public.rate_plans USING btree (agreement_id);


--
-- Name: rate_plans_effective_from_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX rate_plans_effective_from_idx ON public.rate_plans USING btree (effective_from);


--
-- Name: rate_sheets_effective_date_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX rate_sheets_effective_date_idx ON public.rate_sheets USING btree (effective_date);


--
-- Name: rate_sheets_is_active_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX rate_sheets_is_active_idx ON public.rate_sheets USING btree (is_active);


--
-- Name: rate_sheets_partner_id_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX rate_sheets_partner_id_idx ON public.rate_sheets USING btree (partner_id);


--
-- Name: rates_called_number_prefix_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX rates_called_number_prefix_idx ON public.rates USING btree (called_number_prefix);


--
-- Name: rates_rate_sheet_id_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX rates_rate_sheet_id_idx ON public.rates USING btree (rate_sheet_id);


--
-- Name: rates_service_type_direction_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX rates_service_type_direction_idx ON public.rates USING btree (service_type, direction);


--
-- Name: tap_files_partner_id_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX tap_files_partner_id_idx ON public.tap_files USING btree (partner_id);


--
-- Name: tap_files_status_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX tap_files_status_idx ON public.tap_files USING btree (status);


--
-- Name: tap_files_upload_timestamp_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX tap_files_upload_timestamp_idx ON public.tap_files USING btree (upload_timestamp);


--
-- Name: tap_records_call_date_time_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX tap_records_call_date_time_idx ON public.tap_records USING btree (call_date_time);


--
-- Name: tap_records_msisdn_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX tap_records_msisdn_idx ON public.tap_records USING btree (msisdn);


--
-- Name: tap_records_partner_id_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX tap_records_partner_id_idx ON public.tap_records USING btree (partner_id);


--
-- Name: tap_records_processing_status_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX tap_records_processing_status_idx ON public.tap_records USING btree (processing_status);


--
-- Name: tap_records_tap_file_id_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX tap_records_tap_file_id_idx ON public.tap_records USING btree (tap_file_id);


--
-- Name: test_calls_partner_id_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX test_calls_partner_id_idx ON public.test_calls USING btree (partner_id);


--
-- Name: test_calls_scheduled_time_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX test_calls_scheduled_time_idx ON public.test_calls USING btree (scheduled_time);


--
-- Name: test_calls_status_idx; Type: INDEX; Schema: public; Owner: arshan
--

CREATE INDEX test_calls_status_idx ON public.test_calls USING btree (status);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: arshan
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: agreements agreements_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.agreements
    ADD CONSTRAINT agreements_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: anomalies anomalies_investigated_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.anomalies
    ADD CONSTRAINT anomalies_investigated_by_id_fkey FOREIGN KEY (investigated_by_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: anomalies anomalies_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.anomalies
    ADD CONSTRAINT anomalies_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: billing_cycles billing_cycles_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.billing_cycles
    ADD CONSTRAINT billing_cycles_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: billing_cycles billing_cycles_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.billing_cycles
    ADD CONSTRAINT billing_cycles_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: disputes disputes_assigned_to_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_assigned_to_id_fkey FOREIGN KEY (assigned_to_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: disputes disputes_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: disputes disputes_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: disputes disputes_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoices invoices_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: raex_forms raex_forms_agreement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.raex_forms
    ADD CONSTRAINT raex_forms_agreement_id_fkey FOREIGN KEY (agreement_id) REFERENCES public.agreements(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: rate_plans rate_plans_agreement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.rate_plans
    ADD CONSTRAINT rate_plans_agreement_id_fkey FOREIGN KEY (agreement_id) REFERENCES public.agreements(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: rate_sheets rate_sheets_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.rate_sheets
    ADD CONSTRAINT rate_sheets_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: rates rates_rate_sheet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.rates
    ADD CONSTRAINT rates_rate_sheet_id_fkey FOREIGN KEY (rate_sheet_id) REFERENCES public.rate_sheets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tap_files tap_files_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.tap_files
    ADD CONSTRAINT tap_files_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tap_records tap_records_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.tap_records
    ADD CONSTRAINT tap_records_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tap_records tap_records_tap_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.tap_records
    ADD CONSTRAINT tap_records_tap_file_id_fkey FOREIGN KEY (tap_file_id) REFERENCES public.tap_files(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: test_calls test_calls_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.test_calls
    ADD CONSTRAINT test_calls_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: arshan
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: arshan
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict DwPUlVXErRPkZwWdBbFKUktTHvAgVYJsZee0yEtaOAlF3OuJ6BapvmCx3EXH1a2


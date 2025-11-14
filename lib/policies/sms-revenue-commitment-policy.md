# MONTHLY OUTGOING SMS REVENUE COMMITMENT POLICY

**Policy Reference:** SMS-RC-POL-001
**Version:** 1.0
**Effective Date:** [EFFECTIVE-DATE]
**Review Date:** [REVIEW-DATE]
**Policy Owner:** Commercial Operations Department

---

## 1. PURPOSE AND SCOPE

### 1.1 Purpose

This policy establishes the framework for Monthly Outgoing SMS Revenue Commitments between the Operator and its Interconnect Partners, ensuring minimum revenue guarantees and predictable business relationships.

### 1.2 Scope

This policy applies to:
- All Vendor and Reciprocal interconnect partners
- Outgoing International SMS traffic
- Monthly billing cycles
- All commercial agreements with revenue commitment clauses

### 1.3 Objectives

- Ensure predictable minimum revenue streams from SMS traffic
- Provide partners with volume guarantees for capacity planning
- Establish clear consequences for commitment shortfalls
- Create transparent measurement and reporting mechanisms

---

## 2. DEFINITIONS

**2.1 Monthly Revenue Commitment (MRC):**
The minimum guaranteed revenue that a partner must generate through outgoing SMS traffic in a calendar month.

**2.2 Outgoing SMS:**
Short Message Service (SMS) messages originated from the Operator's network and terminated on the Partner's network or third-party networks via the Partner.

**2.3 Billable SMS:**
Successfully delivered SMS messages that meet quality and delivery criteria as defined in the Master Interconnect Agreement.

**2.4 Commitment Period:**
The calendar month from the 1st day 00:00:00 UTC to the last day 23:59:59 UTC.

**2.5 Shortfall:**
The difference between the Monthly Revenue Commitment and actual revenue generated when actual revenue is below the commitment.

**2.6 Commitment Rate:**
The agreed per-SMS rate used to calculate the minimum message volume required to meet the Monthly Revenue Commitment.

---

## 3. COMMITMENT STRUCTURE

### 3.1 Minimum Monthly Revenue Commitment

Partners shall commit to one of the following tiers:

| Tier | Monthly Revenue Commitment | Approximate Message Volume* | Partner Benefits |
|------|---------------------------|----------------------------|------------------|
| **Bronze** | $5,000 USD | 50,000 - 100,000 messages | Standard rates, Standard support |
| **Silver** | $15,000 USD | 150,000 - 300,000 messages | 5% rate discount, Priority support |
| **Gold** | $50,000 USD | 500,000 - 1,000,000 messages | 10% rate discount, Dedicated account manager |
| **Platinum** | $150,000 USD | 1,500,000+ messages | 15% rate discount, Premium SLA, Custom integration support |

*Volume estimates based on average rate of $0.05 - $0.10 per SMS depending on destination

### 3.2 Commitment Calculation Method

**Monthly Revenue = Σ (SMS Volume × Applicable Rate per Destination)**

Where:
- SMS Volume = Number of successfully delivered messages
- Applicable Rate = Rate defined in the current Rate Sheet for specific destination prefixes
- Calculation performed per destination prefix/country code

### 3.3 Commitment Period

- **Billing Period:** Calendar month (1st to last day)
- **Measurement Window:** 00:00:00 UTC on 1st day to 23:59:59 UTC on last day
- **Grace Period:** First 90 days of new partnership (reduced commitment or waiver may apply)

---

## 4. COMMITMENT ENFORCEMENT

### 4.1 Shortfall Charges

If actual revenue falls below the Monthly Revenue Commitment:

**Shortfall Charge = (MRC - Actual Revenue) × Penalty Multiplier**

**Penalty Multipliers by Shortfall Percentage:**

| Shortfall Percentage | Penalty Multiplier | Example (MRC: $10,000) |
|---------------------|-------------------|------------------------|
| 0% - 10% | 0% | No penalty |
| 11% - 25% | 50% | Shortfall $2,000 → Penalty $1,000 |
| 26% - 50% | 75% | Shortfall $4,000 → Penalty $3,000 |
| 51% - 75% | 100% | Shortfall $6,000 → Penalty $6,000 |
| 76% - 100% | 100% + breach review | Shortfall $8,000 → Penalty $8,000 + review |

**Shortfall Percentage = ((MRC - Actual Revenue) / MRC) × 100**

### 4.2 Consecutive Shortfalls

Consecutive monthly shortfalls trigger escalating actions:

| Consecutive Months Below MRC | Action |
|------------------------------|--------|
| 1-2 months | Shortfall charges apply, account review meeting |
| 3 months | Shortfall charges apply, formal written warning, commitment renegotiation discussion |
| 4 months | Shortfall charges apply, service quality review, potential commitment reduction |
| 5+ months | Agreement termination clause activation, contract renegotiation mandatory |

### 4.3 Waiver and Force Majeure

Shortfall charges may be waived under:

- **Technical Failures:** Operator network downtime exceeding SLA
- **Force Majeure Events:** Natural disasters, war, government restrictions
- **Regulatory Changes:** New laws preventing traffic flow
- **Agreed Maintenance Windows:** Planned maintenance with >7 days notice

Waiver requests must be submitted within 15 days of month-end with supporting documentation.

---

## 5. TRAFFIC QUALITY REQUIREMENTS

### 5.1 Minimum Quality Standards

For SMS traffic to count toward revenue commitment:

- **Delivery Success Rate:** Minimum 95% delivery success
- **Delivery Time:** Maximum 30 seconds average delivery time
- **Valid Format:** Messages must comply with GSM 03.40 / 3GPP TS 23.040
- **Non-Fraud Traffic:** Messages must pass fraud detection systems
- **Genuine Traffic:** Test messages and artificially generated traffic excluded

### 5.2 Traffic Exclusions

The following do not count toward MRC:

- Failed or undelivered messages
- Messages to invalid/non-existent numbers
- Test messages and system-generated test traffic
- Refunded messages due to technical issues
- Messages identified as spam or fraudulent
- Messages during agreed maintenance windows

### 5.3 Quality Disputes

Partners may dispute traffic quality assessments within 30 days of month-end. Disputes must include:
- Specific date/time ranges in question
- Sample message IDs and delivery reports
- Technical logs supporting the dispute
- Proposed adjustment amount

---

## 6. REPORTING AND TRANSPARENCY

### 6.1 Daily Reporting

Partners receive automated daily reports including:

- **Yesterday's Traffic:** SMS volume and revenue by destination
- **Month-to-Date Progress:** Cumulative revenue vs. commitment
- **Projected Shortfall:** Forecasted month-end position
- **Top Destinations:** Breakdown by country/prefix
- **Quality Metrics:** Delivery success rates

**Delivery Method:** Automated email and API access
**Delivery Time:** 06:00 UTC daily

### 6.2 Weekly Dashboard Access

Partners have 24/7 access to online dashboards showing:

- Real-time traffic volumes
- Revenue accumulation trends
- Commitment progress percentage
- Historical performance (last 12 months)
- Destination-wise analytics

### 6.3 Monthly Reconciliation

Within 5 business days of month-end:

- **Preliminary Report:** Draft calculation of actual revenue and shortfall
- **Dispute Window:** 10 business days to raise disputes
- **Final Invoice:** Issued after dispute window closes
- **Payment Due:** As per Master Agreement payment terms

---

## 7. COMMITMENT ADJUSTMENT MECHANISMS

### 7.1 Upward Adjustments

Partners may request commitment increase at any time:

- **Process:** Submit written request with justification
- **Approval:** Commercial team review and approval
- **Effective Date:** Following month 1st day
- **Benefits:** May unlock higher tier benefits immediately

### 7.2 Downward Adjustments

Partners may request commitment reduction under limited circumstances:

- **Eligibility:** Must have met commitment for prior 6 consecutive months OR significant market change
- **Process:** Submit request with business justification 60 days in advance
- **Approval:** Senior management approval required
- **Effective Date:** Minimum 90 days from request
- **Frequency:** Maximum once per 12 months

### 7.3 Temporary Suspensions

Commitment may be temporarily suspended (no charges) for:

- **Agreed Maintenance:** Planned network maintenance >48 hours
- **Regulatory Restrictions:** Government-imposed traffic restrictions
- **Technical Failures:** Operator-side failures lasting >24 hours
- **Force Majeure:** As defined in Master Agreement

Suspension requires written agreement from both parties.

---

## 8. COMMITMENT INCENTIVES

### 8.1 Overachievement Bonuses

Partners exceeding commitment receive graduated bonuses:

| Overachievement | Bonus Structure |
|----------------|-----------------|
| 110% - 125% of MRC | 2% rebate on next month's invoice |
| 126% - 150% of MRC | 5% rebate on next month's invoice |
| 151% - 200% of MRC | 7.5% rebate + tier upgrade consideration |
| Over 200% of MRC | 10% rebate + immediate tier upgrade |

### 8.2 Consistency Rewards

Partners meeting or exceeding commitment for consecutive months:

| Consecutive Months | Reward |
|-------------------|--------|
| 6 months | One-time $500 credit |
| 12 months | $2,000 credit + free rate sheet optimization review |
| 24 months | $5,000 credit + custom integration development |

### 8.3 Volume Growth Incentives

Year-over-year growth incentives:

- **20%+ Growth:** Additional 3% rate discount for following year
- **50%+ Growth:** Additional 5% rate discount + free fraud monitoring tools
- **100%+ Growth:** Custom commercial terms negotiation

---

## 9. GOVERNANCE AND COMPLIANCE

### 9.1 Policy Review

This policy shall be reviewed:

- **Annually:** Full policy review by Commercial and Legal teams
- **Quarterly:** Performance metrics and tier structure review
- **Ad-hoc:** Upon significant market or regulatory changes

### 9.2 Amendments

Policy amendments require:

- Approval by Chief Commercial Officer
- 60 days written notice to all affected partners
- Option for partners to renegotiate or terminate if materially adverse

### 9.3 Exceptions

Exceptions to this policy require:

- Written request with detailed justification
- Approval by Senior Management Committee
- Documentation in partner file
- Review after 6 months

### 9.4 Audit Rights

The Operator reserves the right to:

- Audit partner SMS traffic quality and sources
- Request traffic source documentation
- Suspend traffic if fraudulent or artificial inflation suspected
- Adjust historical revenue calculations if errors discovered

---

## 10. IMPLEMENTATION AND TRANSITION

### 10.1 New Partner Onboarding

- **Initial Commitment Selection:** During contract negotiation
- **Ramp-Up Period:** First 90 days may have reduced commitment (50% of full)
- **First Measurement:** Begins on first full calendar month after activation

### 10.2 Existing Partner Transition

For partners transitioning from non-commitment to commitment model:

- **Baseline Calculation:** Average of prior 6 months revenue
- **Proposed Tier:** Based on historical average
- **Transition Period:** 3 months with 50% shortfall penalties
- **Acceptance:** Mutual written agreement required

### 10.3 Training and Support

Partners receive:

- Onboarding session on commitment policy and reporting tools
- Access to online documentation and FAQs
- Dedicated support contact for commitment-related questions
- Quarterly business review meetings

---

## 11. DISPUTE RESOLUTION

### 11.1 Dispute Process

**Step 1 - Commercial Review (Days 1-15):**
- Partner submits formal dispute with documentation
- Commercial team reviews within 5 business days
- Discussion and negotiation

**Step 2 - Management Escalation (Days 16-30):**
- If unresolved, escalate to senior management
- Joint review meeting
- Attempt good faith resolution

**Step 3 - Formal Arbitration (Days 31+):**
- As per Master Interconnect Agreement dispute clause
- Independent arbitration
- Binding resolution

### 11.2 Payment During Disputes

- Undisputed portions of invoice remain payable
- Disputed amounts may be held in escrow
- Interest on successful dispute adjustments

---

## 12. TERMINATION AND WIND-DOWN

### 12.1 Impact on Termination

Upon agreement termination:

- Pro-rata commitment for partial month
- Final reconciliation within 30 days
- No shortfall charges if termination by Operator for cause
- Full shortfall charges if termination by Partner without cause

### 12.2 Notice Period Obligations

During notice period:

- Full commitment remains in effect
- Shortfall charges continue to apply
- No downward adjustments permitted

---

## 13. CONTACT AND SUPPORT

### 13.1 Policy Inquiries

**Email:** sms-commitment@operator.com
**Phone:** +[COUNTRY-CODE] [PHONE-NUMBER]
**Business Hours:** 09:00 - 17:00 [TIMEZONE], Monday-Friday

### 13.2 Technical Support

**Email:** sms-support@operator.com
**24/7 Hotline:** +[COUNTRY-CODE] [PHONE-NUMBER]

### 13.3 Commercial Discussions

**Email:** commercial@operator.com
**Account Managers:** See partner portal for assigned contact

---

## 14. APPENDICES

### Appendix A: Sample Commitment Calculation

**Example:**
- Monthly Revenue Commitment: $10,000 USD
- Actual SMS Sent: 150,000 messages
- Average Rate: $0.06 per SMS
- Actual Revenue: $9,000 USD
- Shortfall: $1,000 (10%)
- Penalty Multiplier: 0% (within 0-10% tolerance)
- **Total Amount Due: $9,000 (no shortfall charge)**

### Appendix B: Reporting Template

[Sample daily and monthly report formats]

### Appendix C: Dispute Form

[Standard dispute submission template]

### Appendix D: Commitment Amendment Request Form

[Form for requesting commitment changes]

---

**Document Control:**
- **Version:** 1.0
- **Date:** [DATE]
- **Author:** Commercial Operations
- **Approved By:** Chief Commercial Officer
- **Next Review:** [DATE + 12 months]

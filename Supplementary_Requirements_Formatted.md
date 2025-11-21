# **Supplementary Requirements**
## **Interconnect & Roaming Solution**
Additional Requirements from MT RFQ

Version 1.0
## **1. Least Cost Routing (LCR) Module**
### **1.1 Module Overview**
The LCR module optimizes outbound traffic routing based on cost, QoS, route availability and partner commitments. It continuously evaluates carrier rate sheets and recommends optimal routes.
### **1.2 Core Data Entities**
#### ***1.2.1 CarrierPricelist Entity***

|Field Name|Type|Required|Description|
| :- | :- | :- | :- |
|pricelist\_id|UUID|Yes|Primary key|
|carrier\_id|UUID|Yes|Foreign key to Carrier|
|effective\_date|DATE|Yes|Rates effective from|
|expiry\_date|DATE|No|Rates expiry|
|notice\_period\_days|INTEGER|Yes|Required notice period|
|update\_type|ENUM|Yes|FULL / PARTIAL / DELTA|
|source\_file\_url|TEXT|No|File storage URL|
|status|ENUM|Yes|PENDING / VALIDATED / ACTIVE|
|confirmation\_sent|BOOLEAN|Yes|Confirmation notification flag|
|created\_at|TIMESTAMP|Yes|Created timestamp|
#### ***1.2.2 CarrierRate Entity***

|Field Name|Type|Required|Description|
| :- | :- | :- | :- |
|rate\_id|UUID|Yes|Primary key|
|pricelist\_id|UUID|Yes|Foreign key to CarrierPricelist|
|destination\_code|VARCHAR(20)|Yes|Dial code / prefix|
|destination\_name|VARCHAR(255)|Yes|Destination|
|rate\_per\_minute|DECIMAL(10,6)|Yes|Rate|
|billing\_increment|ENUM|Yes|PER\_SECOND / PER\_MINUTE / 60\_60|
|asr\_percentage|DECIMAL(5,2)|No|ASR|
|acd\_seconds|INTEGER|No|ACD|
|peak\_rate|DECIMAL(10,6)|No|Peak rate|
|offpeak\_rate|DECIMAL(10,6)|No|Off-peak rate|
### **1.3 LCR API Specifications**
POST /api/v1/lcr/pricelists/import

POST /api/v1/lcr/routing/calculate
## **2. Credit Control & Collections**
### **2.1 Overview**
Manages credit limits, surcharges, bank guarantees, partner credit statuses and collections life cycle.
### **2.2 Core Entities**
#### ***2.2.1 CreditProfile Entity***

|Field Name|Type|Required|Description|
| :- | :- | :- | :- |
|credit\_profile\_id|UUID|Yes|Primary key|
|partner\_id|UUID|Yes|Partner reference|
|credit\_limit|DECIMAL(15,2)|Yes|Max credit allowed|
|payment\_terms\_days|INTEGER|Yes|Payment terms|
|surcharge\_category|VARCHAR(50)|Yes|Surcharge category|
|surcharge\_rate|DECIMAL(5,2)|Yes|Surcharge %|
|surcharge\_trigger\_days|INTEGER|Yes|Days after due date|
|bank\_guarantee\_required|BOOLEAN|Yes|BG required|
|bank\_guarantee\_amount|DECIMAL(15,2)|No|Bank guarantee amount|
|status|ENUM|Yes|ACTIVE / SUSPENDED / BLOCKED|
## **3. Volume Commitments & Discounting**
### **3.1 Overview**
Tracks traffic commitments, discount tiers, revenue commitments and shortfall penalties.
### **3.2 Core Entities**
#### ***3.2.1 VolumeCommitment Entity***

|Field Name|Type|Required|Description|
| :- | :- | :- | :- |
|commitment\_id|UUID|Yes|Primary key|
|partner\_id|UUID|Yes|Partner|
|destination\_group\_id|UUID|No|Destination group|
|commitment\_type|ENUM|Yes|MONTHLY / QUARTERLY / ANNUAL|
|committed\_volume\_minutes|BIGINT|Yes|Committed minutes|
|committed\_revenue\_amount|DECIMAL(15,2)|No|Committed revenue|
|start\_date|DATE|Yes|Start|
|end\_date|DATE|Yes|End|
|penalty\_rate|DECIMAL(5,2)|No|Penalty for shortfall|
|discount\_scheme\_id|UUID|No|Linked scheme|
|status|ENUM|Yes|ACTIVE / EXPIRED / TERMINATED|
#### ***3.2.2 DiscountScheme Entity***

|Field Name|Type|Required|Description|
| :- | :- | :- | :- |
|scheme\_id|UUID|Yes|Primary key|
|scheme\_name|VARCHAR(255)|Yes|Name|
|discount\_type|ENUM|Yes|TIERED\_RATE / FIXED\_RATE / REBATE|
|applies\_to|ENUM|Yes|VOLUME / REVENUE|
|valid\_from|DATE|Yes|Start|
|valid\_to|DATE|No|End|
|status|ENUM|Yes|ACTIVE / EXPIRED|
#### ***3.2.3 DiscountTier Entity***

|Field|Type|Required|Description|
| :- | :- | :- | :- |
|tier\_id|UUID|Yes|Primary key|
|scheme\_id|UUID|Yes|Discount scheme|
|from\_volume|BIGINT|No|Min volume|
|to\_volume|BIGINT|No|Max volume|
|discount\_percentage|DECIMAL(5,2)|Yes|Discount %|
|rate\_adjustment|DECIMAL(10,6)|No|Rate reduction|
## **4. Advanced Reconciliation**
### **4.1 Overview**
Performs multi-level reconciliation: xDR, daily and invoice-level, highlighting mismatches and financial exposure.
### **4.2 Core Entities**
#### ***4.2.1 ReconciliationBatch Entity***

|Field|Type|Required|Description|
| :- | :- | :- | :- |
|batch\_id|UUID|Yes|Primary key|
|partner\_id|UUID|Yes|Partner|
|reconciliation\_type|ENUM|Yes|XDR / DAILY / INVOICE|
|period\_start|DATE|Yes|Start period|
|period\_end|DATE|Yes|End period|
|status|ENUM|Yes|PENDING / PROCESSING / COMPLETED|
|created\_at|TIMESTAMP|Yes|Created at|
#### ***4.2.2 ReconciliationResult Entity***

|Field|Type|Required|Description|
| :- | :- | :- | :- |
|result\_id|UUID|Yes|Primary key|
|batch\_id|UUID|Yes|Batch|
|expected\_count|BIGINT|Yes|Expected xDR count|
|received\_count|BIGINT|Yes|Received count|
|matched\_count|BIGINT|Yes|Matched records|
|mismatched\_count|BIGINT|Yes|Mismatched records|
|missing\_records|BIGINT|Yes|Missing|
|financial\_impact|DECIMAL(15,2)|Yes|Amount difference|
|dispute\_flag|BOOLEAN|Yes|Dispute triggered|
## **5. QoS Tracking & Reporting**
### **5.1 Overview**
Monitors ASR, ACD, NER, PDD and route stability to enforce SLAs and influence routing.
#### ***5.2 QoSMetrics Entity***

|Field|Type|Required|Description|
| :- | :- | :- | :- |
|qos\_id|UUID|Yes|Primary key|
|carrier\_id|UUID|Yes|Carrier|
|destination\_code|VARCHAR(20)|Yes|Prefix|
|asr|DECIMAL(5,2)|Yes|ASR %|
|acd\_seconds|INTEGER|Yes|ACD|
|ner|DECIMAL(5,2)|No|NER|
|pdd\_ms|INTEGER|No|PDD in ms|
|window|ENUM|Yes|HOURLY / DAILY / WEEKLY|
## **6. Numbering Plan Management**
### **6.1 Overview**
Manages numbering plans, prefixes, conflicts, fraud-prone ranges, and updates cross-module rating dependencies.
#### ***6.2 NumberingPlan Entity***

|Field|Type|Required|Description|
| :- | :- | :- | :- |
|np\_id|UUID|Yes|Primary key|
|destination\_code|VARCHAR(20)|Yes|Prefix|
|country|VARCHAR(100)|Yes|Country|
|region|VARCHAR(100)|No|Region|
|description|VARCHAR(255)|No|Description|
|effective\_from|DATE|Yes|Start date|
|status|ENUM|Yes|ACTIVE / DEPRECATED|
## **7. Peak / Off-Peak Rating Definitions**
### **7.1 Overview**
Configurable timebands defining peak, off-peak, weekend and holiday rating windows.
#### ***7.2 RatingTimeband Entity***

|Field|Type|Required|Description|
| :- | :- | :- | :- |
|timeband\_id|UUID|Yes|Primary key|
|name|VARCHAR(100)|Yes|PEAK / OFF\_PEAK / WEEKEND / HOLIDAY|
|start\_time|TIME|Yes|Start time|
|end\_time|TIME|Yes|End time|
|applies\_on|ENUM|Yes|ALL\_DAYS / WEEKDAYS / WEEKENDS|
|country\_code|VARCHAR(3)|No|Country-specific|


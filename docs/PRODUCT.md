# CleanOps Pro — Product Blueprint

## 1. Vision

Build the operating system for a B2B commercial cleaning company. Organizations request and manage cleaning services; CleanOps Pro assesses the facility, quotes and contracts the work, assigns verified professionals, executes site-specific SOPs, verifies quality and manages billing.

## 2. Customer segments

- Schools, colleges and universities
- Hospitals, clinics and diagnostics
- Corporate offices and coworking facilities
- Hotels and hospitality
- Factories and industrial sites
- Warehouses and logistics facilities
- Retail stores, malls and showrooms
- Apartments, RWAs and managed communities
- Gyms, clubs and sports facilities
- Government and institutional facilities

## 3. Primary personas

### Client Organization Admin
Owns the organization, facilities, contacts and contracts.

### Client Facility Manager
Creates requests, manages schedules, reviews reports, raises issues and approves work.

### Operations Manager
Converts requests into quotes, designs teams, schedules jobs and handles exceptions.

### Site Supervisor
Leads an on-site team, manages attendance, checklist completion and inspection handoff.

### Cleaning Professional
Completes assigned work, checklists, evidence capture and issue reporting.

### Finance Manager
Manages invoices, collections, credits and contract economics.

### Platform Admin
Controls global configuration, roles, verification policies, service catalogue and audit access.

## 4. Core lifecycle

1. Client submits facility/service request.
2. Operations reviews scope and requests missing information.
3. Facility assessment records size, areas, hours, risk zones, frequency and media.
4. Quote is generated using staffing, consumables, equipment, logistics and target margin.
5. Client accepts quote and service agreement.
6. Contract creates service plan, SLA and recurring schedules.
7. Operations assigns a qualified team based on skill, location, availability and workload.
8. Professionals check in and execute the facility SOP.
9. Evidence is captured throughout the job.
10. Supervisor validates quality and closes the job.
11. Exceptions/complaints create tracked actions.
12. Billing generates invoice and tracks payment.

## 5. MVP modules

### Client
- Organization registration
- Facility/location management
- Service request
- Quote review
- Contract view
- Service calendar
- Issue/complaint submission
- Service reports
- Invoice history

### Workforce
- Professional profile
- Verification status
- Classification levels
- Skills/certifications
- Availability
- Assignment
- Check-in/out
- SOP checklist
- Before/after evidence
- Issue reporting
- Earnings/attendance summary

### Operations
- Requests queue
- Assessment
- Quote builder
- Contract management
- Team assignment
- Scheduling
- Site execution board
- Inspection
- Complaint management
- SLA monitoring
- Workforce directory
- Billing and profitability

## 6. Professional classification

- L1 General Cleaning Professional
- L2 Certified Cleaning Professional
- L3 Specialized Professional
- L4 Senior Professional / Team Lead
- L5 Site Supervisor

Classification should be driven by completed training, approved skills, work history, performance and any required external verification. Never display a verification badge until its evidence exists.

## 7. Service catalogue

- Recurring janitorial cleaning
- Deep cleaning
- Hospital sanitation
- Classroom and campus cleaning
- Carpet cleaning
- Floor scrubbing/polishing
- Glass and façade cleaning
- Washroom sanitation
- Kitchen/commercial food-area cleaning
- Post-construction cleaning
- Industrial/warehouse cleaning
- Event/emergency cleaning

## 8. Contract economics

Every contract should support:

- Monthly contract value
- Staffing cost
- Supervisor cost
- Consumables
- Equipment allocation
- Transport/logistics
- Taxes/fees
- Gross profit
- Gross margin
- SLA penalties/credits where applicable
- Renewal date

## 9. Quality system

A job must be verifiable, not just marked complete.

Recommended completion evidence:

- Check-in/out
- Checklist completion
- Before/after photos where appropriate
- Supervisor inspection
- Customer approval where required
- Incident/exception log

## 10. AI roadmap

Phase 2 AI capabilities:

- Facility photo/video assessment assistance
- Scope normalization
- Quote recommendations
- Professional/team assignment recommendation
- Quality anomaly detection from operational evidence
- SLA risk prediction
- Contract profitability insights
- Demand forecasting

AI recommendations must remain reviewable by operations and should never silently override safety, compliance or contractual controls.

## 11. Non-functional requirements

- Server-side role enforcement
- Tenant isolation
- Immutable audit trail for sensitive operations
- Idempotent job and payment operations
- Secure file upload handling
- Observability and health/readiness checks
- Rate limiting and abuse controls
- Encryption in transit and appropriate encryption at rest
- Backup and recovery plan
- Responsive professional mobile workflow
- Production configuration through environment variables

## 12. Phased delivery

### Phase 1 — Launch MVP
Requests, clients, facilities, quoting, contracts, scheduling, workforce, checklists, attendance, inspections and invoices.

### Phase 2 — Intelligence
AI assessment, assignment recommendations, quality intelligence, alerts and forecasting.

### Phase 3 — Scale
Multi-region operations, advanced finance, partner network, enterprise SSO, deep analytics and integrations.

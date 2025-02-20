# ZAP by Checkmarx Scanning Report

**Generated with The ZAP logoZAP on Thu 20 Feb 2025, at 11:52:38**

- **ZAP Version**: 2.16.0
- **Scanning Tool**: ZAP by Checkmarx

### Report Parameters

- **Contexts**: No contexts were selected, so all contexts were included by default.
- **Sites**: `http://localhost:8000`

---

### Alert Counts by Risk and Confidence

| **Confidence**        | **High**  | **Medium** | **Low**  | **Total** |
|-----------------------|-----------|------------|----------|-----------|
| **Risk**              |           |            |          |           |
| High                  | 0 (0.0%)  | 0 (0.0%)   | 0 (0.0%) | 0 (0.0%)  |
| Medium                | 0 (0.0%)  | 1 (25.0%)  | 1 (25.0%)| 2 (50.0%) |
| Low                   | 0 (0.0%)  | 0 (0.0%)   | 2 (50.0%)| 2 (50.0%) |
| Informational         | 0 (0.0%)  | 0 (0.0%)   | 0 (0.0%) | 0 (0.0%)  |
| **Total**             | 0 (0.0%)  | 1 (25.0%)  | 3 (75.0%)| 4 (100%)  |

---

### Alerts by Site and Risk

| **Site**              | **High (0)** | **Medium (2)** | **Low (2)** | **Informational (0)** |
|-----------------------|--------------|----------------|-------------|-----------------------|
| `http://localhost:8000` | 0            | 2              | 2           | 0                     |

---

### Alerts by Alert Type

| **Alert Type**                          | **Risk** | **Count** |
|-----------------------------------------|----------|-----------|
| Content Security Policy (CSP) Header Not Set | Medium   | 1         |
| Missing Anti-clickjacking Header       | Medium   | 1         |
| Application Error Disclosure           | Low      | 1         |
| X-Content-Type-Options Header Missing  | Low      | 2         |

---

## Detailed Alerts

### **Medium Risk Alerts**

#### 1. Content Security Policy (CSP) Header Not Set

- **Location**: `GET http://localhost:8000/register`
- **Description**: The response does not contain a CSP header to mitigate potential Cross-Site Scripting (XSS) risks.

#### 2. Missing Anti-clickjacking Header

- **Location**: `GET http://localhost:8000/register`
- **Description**: The page is vulnerable to clickjacking attacks.

### **Low Risk Alerts**

#### 1. Application Error Disclosure

- **Location**: `POST http://localhost:8000/register`
- **Description**: The application may leak detailed error messages.

#### 2. X-Content-Type-Options Header Missing

- **Location**: `GET http://localhost:8000/register`
- **Description**: The server response does not include the `X-Content-Type-Options` header.

---

### Appendix

#### Alert Types Descriptions

- **Content Security Policy (CSP) Header Not Set**: Mitigate XSS risks by setting a CSP header.
- **Missing Anti-clickjacking Header**: Prevent clickjacking attacks by adding `X-Frame-Options` or `frame-ancestors` to the CSP.
- **Application Error Disclosure**: Use generic error messages to avoid information disclosure.
- **X-Content-Type-Options Header Missing**: Prevent MIME type sniffing by adding the `X-Content-Type-Options` header.

---

This concludes the full penetration testing and ZAP scanning report for the **Booking System - Phase 1 Registration Page**.

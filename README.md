# FundsRoom ERP & CRM Operations Portal

A full-stack Mini ERP + CRM Operations Portal built as part of the FundsRoom Full Stack Developer Case Study.

The application is designed for a wholesale/distribution business to manage customers, products, inventory, stock movements, sales challans, users, and business reports.

---

## Project Overview

FundsRoom ERP & CRM provides a centralized internal operations portal for managing day-to-day business activities.

The system supports:

- JWT-based authentication
- Customer management
- Product management
- Inventory management
- Stock IN/OUT movements
- Sales challan creation
- Challan confirmation
- User management
- Dashboard statistics
- Low-stock reporting
- Sales reporting
- Stock movement reporting
- Customer follow-ups
- PostgreSQL database persistence
- REST API communication

The project follows a client-server architecture:

```text
React + TypeScript Frontend
          |
          | REST API / JSON
          v
Node.js + Express + TypeScript Backend
          |
          | SQL
          v
PostgreSQL Database
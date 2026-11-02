# 📊 Housing Clone — Database Schema Excel Export Guide

This document explains how to generate and export the complete MySQL database schema, metadata, and data dictionary into a professional Excel workbook (`.xlsx`).

---

## 1. Automated Excel Workbook Generator Script

The project includes an automated script (`scripts/export-database-schema.ts`) that queries the live MySQL database `INFORMATION_SCHEMA` metadata via Prisma ORM and exports a fully formatted multi-sheet Excel workbook.

### Location of Generated Workbook:
`docs/database/mysql_database_schema.xlsx`

---

## 2. Structure of Generated Excel Sheets

The generated `.xlsx` workbook contains **8 styled worksheets**:

| Sheet # | Sheet Name | Contents & Metadata Captured |
|---|---|---|
| **1** | **Table Summary** | Index, Table Name, Domain Module, Estimated Business Purpose |
| **2** | **Tables and Columns** | Full column breakdown for all 39 tables: Column Name, Data Type, Nullability, Primary/Unique/Foreign Key Flags, Default Values |
| **3** | **Primary Keys** | Primary key columns for every table and key generation strategy (CUID / Auto-Increment) |
| **4** | **Foreign Keys** | Relational foreign keys: Source Table, FK Column, Referenced Table, Referenced Column, Constraint Name |
| **5** | **Relationships** | Parent entity, Child entity, Cardinality (`1:N`, `M:N`, `1:1`), Foreign key connection, and Business Explanation |
| **6** | **Indexes** | Table indexes, index names, indexed columns, and uniqueness flags |
| **7** | **Enums** | Standardized application enums, allowed value options, and business context |
| **8** | **Database Statistics** | Database Engine, Database Name, Total Table Count, Total Column Count, Total FK Count, and Export Timestamp |

---

## 3. How to Run / Re-generate the Excel Export

To re-generate `docs/database/mysql_database_schema.xlsx` anytime after database schema updates:

```bash
# Run the automated Excel export script
npx tsx scripts/export-database-schema.ts
```

### Script Execution Dependencies:
- `exceljs` (Excel file writer)
- `@prisma/client` (MySQL query engine)
- `tsx` (TypeScript executor)

The script uses direct `INFORMATION_SCHEMA` queries, ensuring 100% precision matching your actual live MySQL instance.

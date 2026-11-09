# Database Documentation

## Database

- Database name: `email_automation`
- Database engine: MySQL 8.0
- Character set: `utf8mb4`
- Collation: `utf8mb4_0900_ai_ci`

## Directory Structure

```text
database/
├── exports/
│   ├── email_automation_email_templates.sql
│   ├── email_automation_recipients.sql
│   ├── email_automation_records.sql
│   ├── email_automation_record_recipients.sql
│   ├── email_automation_email_jobs.sql
│   ├── email_automation_email_logs.sql
│   └── email_automation_routines.sql
├── migrations/
└── README.md
```

## Export Files

The `exports/` directory contains MySQL database exports.

| File | Contents |
|---|---|
| `email_automation_email_templates.sql` | Email templates table and exported data |
| `email_automation_recipients.sql` | Recipients table and exported data |
| `email_automation_records.sql` | Records table and exported data |
| `email_automation_record_recipients.sql` | Record-recipient relationship table and exported data |
| `email_automation_email_jobs.sql` | Email jobs table and exported data |
| `email_automation_email_logs.sql` | Email logs table and exported data |
| `email_automation_routines.sql` | Stored procedures |

## Table Dependencies

The tables have the following foreign-key dependencies:

- `record_recipients` references `records` and `recipients`.
- `email_jobs` references `records` and `email_templates`.
- `email_logs` references `email_jobs` and `recipients`.

When restoring the individual table exports, use this order:

1. `email_automation_email_templates.sql`
2. `email_automation_recipients.sql`
3. `email_automation_records.sql`
4. `email_automation_record_recipients.sql`
5. `email_automation_email_jobs.sql`
6. `email_automation_email_logs.sql`

After restoring all six table exports, import `email_automation_routines.sql` to restore the stored procedures.

## Important Safety Notes

- These files are full MySQL exports, not incremental migrations.
- Table exports contain `DROP TABLE IF EXISTS` statements.
- Importing an export can replace existing tables and restore exported data.
- Back up the database before importing any export.
- The exports contain development and test data.
- Do not use these exports as production deployment scripts without reviewing their contents.
- Stored procedures are exported separately.

## Migrations

The `migrations/` directory is reserved for future version-controlled database changes.

Future database changes should use incremental, versioned migration scripts instead of repeatedly replacing complete table exports.

Migration scripts should preserve existing data and must be tested before being applied to a production database.
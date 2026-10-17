# Personal Budget Tracker - Database Design

## Overview

This document describes the database design for the Personal Budget Tracker, built with PostgreSQL and a Java/Spring Boot backend. It distinguishes the **six tables used by the current MVP** from **two tables retained in the proposed ERD for future functionality**.

**Implemented tables:** Users, Account, Category, Budget, Transaction, Transaction Category.

**Planned tables (ERD only; not implemented in PostgreSQL):** Recurring Transaction, Notification.

The ERD may show all eight tables to illustrate the intended future architecture. Planned relationships and fields below are not claims about the deployed schema.

---

## Implemented Tables

### 1. Users

Stores registered users. Each user manages their own accounts, categories, budgets, and transactions.

| Field | Description |
|---|---|
| `id` | Auto-incrementing primary key |
| `email` | Required, unique email address |
| `password` | Required password; **currently stored without hashing** |
| `first_name` | Required first name |
| `last_name` | Required last name |
| `phone_number` | Optional phone number; intended to be unique when provided |

**Security limitation:** Password hashing was not completed for the MVP. Do not use real credentials or deploy the application publicly in this state. Secure password hashing is a priority for future work.

### 2. Account

Stores user-owned financial accounts. Balances change when transactions are created, edited, or deleted.

| Field | Description |
|---|---|
| `id` | Auto-incrementing primary key |
| `user_id` | Foreign key referencing `users.id` |
| `account_name` | User-defined account name |
| `account_type` | `CHECKING` or `SAVINGS` |
| `balance` | Current balance; decimal monetary value (design precision: 19,2) |

### 3. Category

Stores reusable labels for transactions and budgets. Users can create, rename, view, and delete categories independently of transaction entry.

| Field | Description |
|---|---|
| `id` | Auto-incrementing primary key |
| `user_id` | Foreign key referencing `users.id` |
| `category_name` | Name of the category |

New users automatically receive seven categories: **Groceries, Housing, Transportation, Utilities, Entertainment, Healthcare, and Salary**. These are inserted when the user account is created. Existing users are not automatically backfilled.

### 4. Budget

Stores a spending limit for a single category. Users can create, update, delete, enable, and disable budgets. Spending totals are calculated from expense transactions rather than stored on the budget row.

| Field | Description |
|---|---|
| `id` | Auto-incrementing primary key |
| `user_id` | Foreign key referencing `users.id` |
| `budget_name` | User-defined budget name |
| `category_id` | Foreign key referencing `category.id` |
| `spending_limit` | Maximum spending amount; decimal monetary value (design precision: 19,2) |
| `time_period` | `NONE`, `MONTHLY`, `QUARTERLY`, or `YEARLY` |
| `budget_status` | Boolean: enabled or disabled |

Budget periods:

| Value | Spending window |
|---|---|
| `NONE` | All-time spending, without a date restriction |
| `MONTHLY` | Current calendar month |
| `QUARTERLY` | Current calendar quarter |
| `YEARLY` | Current calendar year |

### 5. Transaction

Stores individual income and expense records. Each transaction belongs to a user and a financial account. It may have zero, one, or multiple category labels, and its amount is **not divided** among them.

| Field | Description |
|---|---|
| `id` | Auto-incrementing primary key |
| `user_id` | Foreign key referencing `users.id` |
| `account_id` | Foreign key referencing `account.id` |
| `occurred_at` | Transaction date/time (timestamp in the design) |
| `amount` | Transaction amount; decimal monetary value (design precision: 19,2) |
| `description` | Optional transaction description |
| `transaction_type` | `INCOME` or `EXPENSE` |

**Planned extension:** The original ERD also includes an optional `recurring_transaction_id` foreign key. This is **not part of the implemented MVP transaction model** and would be added if recurring transactions are developed.

### 6. Transaction Category

Junction table representing the many-to-many relationship between transactions and category labels. Removing a category assignment does not delete the category itself.

| Field | Description |
|---|---|
| `transaction_id` | Foreign key referencing `transaction.id` |
| `category_id` | Foreign key referencing `category.id` |

The combination of `transaction_id` and `category_id` is the **composite key in the proposed relational design**, preventing duplicate assignments. Confirm the exact physical key/constraint against the generated PostgreSQL schema if documenting implementation-level DDL.

---

## Planned Tables (ERD Only)

These tables remain in the ERD to document intended extensions. They have **not been implemented**.

### 7. Recurring Transaction — Planned

Would store instructions for generating repeating transactions. The initial design supports one optional category per recurring transaction.

| Field | Description |
|---|---|
| `id` | Auto-incrementing primary key |
| `user_id` | Foreign key referencing `users.id` |
| `account_id` | Foreign key referencing `account.id` |
| `category_id` | Optional foreign key referencing `category.id` |
| `amount` | Amount of each occurrence; decimal monetary value |
| `description` | Optional description |
| `transaction_type` | `INCOME` or `EXPENSE` |
| `frequency` | `DAILY`, `WEEKLY`, or `MONTHLY` |
| `start_date` | Start date |
| `next_occurrence` | Next scheduled date |
| `is_active` | Whether the schedule is enabled |

A future implementation would generate transactions while preventing duplicates and preserving previously generated transaction history when a schedule changes.

### 8. Notification — Planned Design

The original ERD includes a database-backed notification table, but **the current MVP does not implement notifications**. The more recent notification feature concept uses **session-based notification history**, so a persistent table may not be needed for that version. This table is retained as a possible longer-term design.

| Field | Description |
|---|---|
| `id` | Auto-incrementing primary key |
| `user_id` | Foreign key referencing `users.id` |
| `budget_id` | Foreign key referencing `budget.id` |
| `notification_description` | Notification message |
| `is_read` | Read/unread status |
| `created_at` | Creation timestamp |

**Updated proposed behavior:** Notify when a new expense causes an active budget to reach its limit (100%) and on later additional spending beyond that limit. Do not generate notifications merely from editing a budget limit. Notifications for separate affected categories may be generated independently. The proposed session-based interface includes an unread indicator and a way to mark all as read. This behavior is **not implemented**.

---

## Database Enums

| Enum / application value | Allowed values | Used by | Status |
|---|---|---|---|
| `account_type` | `CHECKING`, `SAVINGS` | Account | Implemented |
| `time_period` | `NONE`, `MONTHLY`, `QUARTERLY`, `YEARLY` | Budget | Implemented |
| `transaction_type` | `INCOME`, `EXPENSE` | Transaction | Implemented |
| `frequency` | `DAILY`, `WEEKLY`, `MONTHLY` | Recurring Transaction | Planned |

These are the application's allowed enum values; the actual PostgreSQL representation depends on the JPA mappings and schema configuration.

---

## Database Relationships

### Implemented Relationships

| Relationship | Type | Description |
|---|---|---|
| Users → Account | One-to-Many | One user can have multiple accounts |
| Users → Category | One-to-Many | One user can have multiple categories |
| Users → Budget | One-to-Many | One user can have multiple budgets |
| Users → Transaction | One-to-Many | One user can have multiple transactions |
| Category → Budget | One-to-Many | One category may be associated with multiple budgets |
| Transaction → Transaction Category | One-to-Many | A transaction can have multiple category assignments |
| Category → Transaction Category | One-to-Many | A category can label multiple transactions |
| Transaction ↔ Category | Many-to-Many | Connected through the transaction-category junction table |
| Account → Transaction | One-to-Many | One account can have multiple transactions |

### Planned Relationships

| Relationship | Type | Description |
|---|---|---|
| Users → Recurring Transaction | One-to-Many | User-owned recurring schedules |
| Users → Notification | One-to-Many | User-owned notification records |
| Account → Recurring Transaction | One-to-Many | Account used by recurring schedule |
| Category → Recurring Transaction | One-to-Many | Optional category assigned to recurring schedule |
| Recurring Transaction → Transaction | One-to-Many | Generated transaction history |
| Budget → Notification | One-to-Many | Budget associated with alerts |

---

## Additional Design Considerations

### Account Balances

An income transaction increases its account balance; an expense decreases it. Editing or deleting a transaction adjusts the balance accordingly. Multiple category labels do **not** cause the balance to change multiple times.

### Category Management and Assignment

Categories are reusable user-owned labels. Regular transactions can have zero or multiple categories, while each budget tracks one category. Category deletion should preserve historical transactions and safely handle category assignments and budget references.

### Budget Calculations

Current spending is computed from **expense** transactions assigned to the budget's category and, unless the period is `NONE`, filtered by the applicable calendar period. A transaction labeled with multiple categories may count toward multiple category budgets, but must count **once** in overall expense totals. Multiple budgets for the same category can have overlapping spending windows.

### Planned Recurring Transaction Processing

Proposed scheduling rules are daily (+1 day), weekly (+7 days), and monthly (+1 calendar month). Generated transactions would inherit the schedule's optional category and be tracked separately from future projections. This logic is not part of the MVP.

### Data Integrity and Security

- Monetary values should use precise decimal/NUMERIC representations, not floating-point types.
- Foreign keys and user ownership checks protect relationships and prevent users from accessing other users' records.
- Account balance adjustments and transaction writes should be handled atomically to avoid inconsistencies.
- Deleting a budget must not delete historical transactions; deleting a category must not unintentionally delete transactions.
- Duplicate transaction/category assignments should be prevented.
- Email addresses must be unique; optional phone number uniqueness is part of the original design and should be verified against the live schema.
- **Password hashing is not implemented.** The current storage approach is unsafe for production and must be replaced before public deployment.

---

## Future Database Considerations

- **Recurring transaction categories:** A future `recurring_transaction_category` junction table could support multiple categories per schedule. Existing assignments would need migration.
- **Notification persistence:** Decide whether to keep notifications only in browser session storage or implement the proposed Notification table for durable history.
- **Schema verification:** Confirm physical table names, column types, constraints, nullability, unique indexes, and composite keys against the generated PostgreSQL schema before treating this document as a migration/DDL specification.
- **Constraints:** Finalize non-negative monetary limits where appropriate, valid enum values, and safe deletion behavior.

The README should list future application features; this document focuses on their database impact and the distinction between current and proposed schema.

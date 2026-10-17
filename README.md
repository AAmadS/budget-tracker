# Personal Budget Tracker

A full-stack personal budgeting application for tracking income and expenses, managing financial accounts and spending categories, creating budgets, and reviewing spending summaries.

Built as a capstone project using **Next.js, TypeScript, Tailwind CSS, Java, Spring Boot, PostgreSQL, and Docker Compose**.

## Features

- **Authentication and profile:** Register, log in, log out, and update profile information. Protected API requests use a bearer token.
- **Financial accounts:** Create, view, edit, and delete checking and savings accounts. Account balances update when transactions are created, edited, or deleted.
- **Categories:** Create, rename, and delete categories. New users receive seven default categories: Groceries, Housing, Transportation, Utilities, Entertainment, Healthcare, and Salary.
- **Transactions:** Record income and expenses, assign an account and multiple optional categories, edit and delete records, and browse a date-sorted list. The frontend supports pagination and filtering by date range, category, and account.
- **Budgets:** Create, view, edit, and delete category-based budgets with spending limits and `NONE`, `MONTHLY`, `QUARTERLY`, or `YEARLY` periods. Budgets can be enabled or disabled and display calculated spending progress.
- **Overview:** Review account balances, income and expenses, active budgets, monthly spending, and top spending categories.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 16.4.0 (App Router), React 19.3.0, TypeScript 5.x, Tailwind CSS 4.x |
| Backend | Java 17, Spring Boot 4.1.1, Spring Web MVC, Spring Data JPA |
| Database | PostgreSQL 17 |
| Local database environment | Docker Compose |
| API documentation | springdoc-openapi 3.1.0 / Swagger UI and cURL |

## Getting Started

### Prerequisites

Install the following before starting:

- Git
- Docker Desktop (with Docker Compose)
- Java Development Kit (JDK) 17
- Node.js 20.20.2 (development version) or a compatible newer release, and npm (developed using npm 10.8.2)

The backend uses the included Maven Wrapper (`mvnw`), so a separate Maven installation is not required.

### 1. Clone the repository

```bash
git clone git@github.com:Thrivent-ETS-Cohort-2026/ashameem-budget-capstone.git
cd ashameem-budget-capstone
```

Replace the placeholders with the repository's actual URL and folder name.

### 2. Configure the database password

The repository includes `.env.example`, but **does not include the private `.env` file**.

From the repository root:

```bash
cp .env.example .env
```

Open `.env` and replace the example password with a password of your choice:

```dotenv
DB_PASSWORD=your_local_database_password
```

For the simplest shell setup, use a local development password without spaces or shell-special characters. Do not commit `.env` or use real credentials in this demonstration application.

### 3. Start PostgreSQL

From the repository root, run:

```bash
docker compose up -d
```

Docker Compose starts PostgreSQL 17 with these settings:

| Setting | Value |
|---|---|
| Database | `budget_tracker` |
| Username | `budget_user` |
| Port | `5432` |
| Password | The `DB_PASSWORD` value from `.env` |

The `postgres_data` Docker volume preserves database data across normal container restarts. A new reviewer starts with an empty database; your personal records are **not** included in the repository.

### 4. Start the Spring Boot backend

**Important:** Docker Compose reads the root `.env` automatically, but a Spring Boot process started directly on your computer does **not** automatically load that file.

In a macOS/Linux terminal, from the **repository root**, export the password into that terminal session:

```bash
set -a
source .env
set +a
```

Then start the backend in **that same terminal**:

```bash
cd backend
./mvnw spring-boot:run
```

The backend is configured for `http://localhost:8080`. Its `application.properties` connects to `jdbc:postgresql://localhost:5432/budget_tracker` using `budget_user` and `DB_PASSWORD`.

The setting `spring.jpa.hibernate.ddl-auto=update` allows Hibernate to create or update tables based on the implemented JPA entities when the backend starts. It does **not** automatically create example users or financial records.

### 5. Start the Next.js frontend

Open a **second terminal** from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

The frontend expects the backend at `http://localhost:8080`. Both services must be running for the application to work.

### 6. Create an account and try the application

Register a new account through the frontend. Registration creates seven starter categories. You can then create a financial account, add income or expense transactions, set budgets, and explore the Overview.

### Stopping the application

Stop the backend and frontend with `Ctrl+C` in their respective terminals. From the repository root, stop the database container with:

```bash
docker compose down
```

This preserves the database volume. **Do not use `docker compose down -v` unless you intend to delete the local database data.**

### Database password troubleshooting

If the backend cannot connect, check that Docker is running, PostgreSQL is started, and the terminal running Spring Boot has `DB_PASSWORD` exported. Changing `.env` after PostgreSQL has already initialized its persistent volume does not automatically change the database user's password.

## API Documentation

See [API Endpoints](docs/API_ENDPOINTS.md) for all 21 backend routes, request examples, authentication instructions, and copy-and-paste cURL commands.

Swagger UI is available as a **visual reference** when the backend's SpringDoc configuration is enabled. For this project, protected endpoints are documented and tested with **cURL** rather than through Swagger's authorization interface.

After logging in through the API, you can store the returned token in a macOS/Linux terminal:

```bash
TOKEN="paste-generated-token-here"
```

Then use it for protected requests:

```bash
curl -X GET "http://localhost:8080/api/accounts" \
  -H "Authorization: Bearer $TOKEN"
```

See the API document for registration, login, and every other endpoint.

## Database Design

See [Database Design](docs/DATABASE_DESIGN.md) for the schema, relationships, and design decisions.

The current MVP uses six database tables: Users, Account, Category, Budget, Transaction, and Transaction Category. The proposed ERD also includes **Recurring Transaction** and **Notification** tables; those two are **planned only**, not implemented in the current database.

If an ERD image is included, place it in `docs/images/` and identify it as the **proposed design** so reviewers do not mistake planned tables for implemented ones.

## Known Limitations

- **Password security:** Passwords are currently stored without hashing. This is a local demonstration project and **must not be deployed publicly or used with real credentials** until secure password hashing is implemented.
- **Authentication persistence:** Bearer tokens are held in backend memory and become invalid after the backend restarts. The frontend currently stores the token in session storage.
- **Transaction list behavior:** Filtering and pagination are handled in the frontend, not through backend query parameters.
- **Incomplete assessment features:** Recurring transactions, CSV export, future spending projections, and budget threshold notifications are not implemented.
- **Historical budgets:** The application does not preserve earlier spending-limit values when a budget is edited, so accurate historical budget percentages would require additional budget history tracking.
- **Local configuration:** The frontend currently uses a local backend URL rather than a centralized environment-based API configuration.

## Future Improvements

### Authentication and security

- Replace session-storage token handling with an appropriately secured, HTTP-only cookie approach to better support server-rendered authentication.
- Introduce stronger password requirements and secure password hashing.

### Interface and reporting

- Improve color consistency and visual cues throughout the interface.
- Display month names more clearly on the Overview.
- Add or improve bar charts for financial comparisons.
- Support historical budget views and preserve spending-limit changes so historical calculations remain accurate.
- Revisit whether opening account deposits should be included in total income; opening balances and earned income represent different concepts.

### Features

- Add budget threshold notifications with an unread indicator and notification history.
- Support automatically generated daily, weekly, and monthly recurring transactions.
- Export all or filtered transactions to CSV.
- Add future spending projections and more reporting options.

### Code maintenance

- Centralize the frontend API base URL in configuration or a shared API utility.
- Organize reusable TypeScript types and interfaces into shared files.

## Project Status

This repository contains a working **minimum viable product (MVP)** for the capstone. Core account, category, transaction, budget, and overview workflows are implemented. Some requested features remain future work, as noted above.

# Personal Budget Tracker — API Endpoints

## Overview

The Spring Boot backend exposes a REST API for authentication, user profiles, accounts, categories, transactions, and budgets.

**Local base URL:** `http://localhost:8080`

All routes below begin with `/api`. The endpoint list and success status codes are based on the application's controller classes.

## API testing: Swagger UI and cURL

### Swagger UI

Swagger UI is intended primarily as a **visual reference** for available endpoints, HTTP methods, and request/response models. In the current project workflow, **use cURL to test protected endpoints** because Swagger has not been configured with a convenient bearer-token authorization flow.

> Bearer authentication *can* be configured in Swagger/OpenAPI. The limitation described here is specific to this project's current setup. Consult the backend's Swagger configuration for the exact local Swagger UI URL.

### cURL and authentication

Registration and login do not require an authentication header. Every other endpoint listed here requires a valid bearer token.

After calling the login endpoint, copy the `token` value from the JSON response and store it in a shell variable (macOS/Linux):

```bash
TOKEN="paste-generated-token-here"
```

Use `$TOKEN` to substitute that value in subsequent requests:

```bash
curl -X GET "http://localhost:8080/api/users/me" \
  -H "Authorization: Bearer $TOKEN"
```

The token variable is scoped to the terminal session in which it was set. In this application, tokens are stored in backend memory, so restarting the backend invalidates existing tokens; logging out also invalidates the logged-out token. Never commit real tokens or credentials to Git.

### How to use these examples

Run the registration and login commands first. Copy the `token` value returned by login, then set it in **the same macOS/Linux terminal**:

```bash
TOKEN="paste-generated-token-here"
```

Every protected command below uses `-H "Authorization: Bearer $TOKEN"`. The `$TOKEN` expression substitutes the saved token automatically. The `-H "Content-Type: application/json"` header tells Spring Boot that the `-d` request body contains JSON. A backslash (`\`) at the end of a line lets you paste a multiline command into the terminal.

**Request-body accuracy:** The JSON property names below have been checked against the uploaded Java DTO classes. Replace sample IDs with IDs returned by your own GET requests. Enum values are based on the application's documented enums; the DTOs reference those enum types but do not define their members. These commands are documented examples, not live integration-test results.

**Suggested test order:** Register → Log in → set `TOKEN` → list accounts and categories → create an account → create a transaction → create a budget → test updates and deletes. Run destructive DELETE requests only against test data.

## Authentication — `/api/auth`

| Method | Endpoint | Purpose | Auth | Success |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Register user | No | `201` |
| `POST` | `/api/auth/login` | Log in and receive token | No | `200` |
| `POST` | `/api/auth/logout` | Invalidate token | Yes | `204` |

### Register — POST `/api/auth/register`

```bash
curl -X POST "http://localhost:8080/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"ExamplePassword123!","firstName":"Demo","lastName":"User","phoneNumber":"5551234567"}'
```

### Log in — POST `/api/auth/login`

```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"ExamplePassword123!"}'
```

After login, copy the `token` property from the response and run `TOKEN="your-token"` in the same terminal.

### Log out — POST `/api/auth/logout`

```bash
curl -X POST "http://localhost:8080/api/auth/logout" \
  -H "Authorization: Bearer $TOKEN"
```

## User profile — `/api/users`

| Method | Endpoint | Purpose | Auth | Success |
|---|---|---|---|---|
| `GET` | `/api/users/me` | View profile | Yes | `200` |
| `PUT` | `/api/users/me` | Update profile | Yes | `200` |

### View profile — GET `/api/users/me`

```bash
curl -X GET "http://localhost:8080/api/users/me" \
  -H "Authorization: Bearer $TOKEN"
```

### Update profile — PUT `/api/users/me`

```bash
curl -X PUT "http://localhost:8080/api/users/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Demo","lastName":"Updated","phoneNumber":"5551234567"}'
```

## Accounts — `/api/accounts`

| Method | Endpoint | Purpose | Auth | Success |
|---|---|---|---|---|
| `POST` | `/api/accounts` | Create account | Yes | `201` |
| `GET` | `/api/accounts` | List accounts | Yes | `200` |
| `PUT` | `/api/accounts/{id}` | Update account | Yes | `200` |
| `DELETE` | `/api/accounts/{id}` | Delete account | Yes | `204` |

### Create account — POST `/api/accounts`

```bash
curl -X POST "http://localhost:8080/api/accounts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"accountName":"Checking","accountType":"CHECKING","balance":1000.00}'
```

### List accounts — GET `/api/accounts`

```bash
curl -X GET "http://localhost:8080/api/accounts" \
  -H "Authorization: Bearer $TOKEN"
```

### Update account — PUT `/api/accounts/{id}`

Replace `1` with an existing account ID.

```bash
curl -X PUT "http://localhost:8080/api/accounts/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"accountName":"Main Checking","accountType":"CHECKING"}'
```

### Delete account — DELETE `/api/accounts/{id}`

```bash
curl -X DELETE "http://localhost:8080/api/accounts/1" \
  -H "Authorization: Bearer $TOKEN"
```

## Categories — `/api/categories`

| Method | Endpoint | Purpose | Auth | Success |
|---|---|---|---|---|
| `POST` | `/api/categories` | Create category | Yes | `201` |
| `GET` | `/api/categories` | List categories | Yes | `200` |
| `PUT` | `/api/categories/{id}` | Rename category | Yes | `200` |
| `DELETE` | `/api/categories/{id}` | Delete category | Yes | `204` |

### Create category — POST `/api/categories`

```bash
curl -X POST "http://localhost:8080/api/categories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"categoryName":"Books"}'
```

### List categories — GET `/api/categories`

```bash
curl -X GET "http://localhost:8080/api/categories" \
  -H "Authorization: Bearer $TOKEN"
```

### Rename category — PUT `/api/categories/{id}`

```bash
curl -X PUT "http://localhost:8080/api/categories/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"categoryName":"Books and Supplies"}'
```

### Delete category — DELETE `/api/categories/{id}`

```bash
curl -X DELETE "http://localhost:8080/api/categories/1" \
  -H "Authorization: Bearer $TOKEN"
```

Newly registered users automatically receive default categories; no separate endpoint is needed.

## Transactions — `/api/transactions`

| Method | Endpoint | Purpose | Auth | Success |
|---|---|---|---|---|
| `POST` | `/api/transactions` | Create transaction | Yes | `201` |
| `GET` | `/api/transactions` | List transactions | Yes | `200` |
| `PUT` | `/api/transactions/{id}` | Update transaction | Yes | `200` |
| `DELETE` | `/api/transactions/{id}` | Delete transaction | Yes | `204` |

### Create transaction — POST `/api/transactions`

Use an existing account ID and category ID from the corresponding GET endpoints. The `occurredAt` field is a Java `LocalDateTime`, shown here using an ISO-style date-time string without a timezone offset.

```bash
curl -X POST "http://localhost:8080/api/transactions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"accountId":1,"occurredAt":"2026-10-16T12:00:00","amount":25.50,"description":"Lunch","transactionType":"EXPENSE","categoryIds":[1]}'
```

### List transactions — GET `/api/transactions`

```bash
curl -X GET "http://localhost:8080/api/transactions" \
  -H "Authorization: Bearer $TOKEN"
```

### Update transaction — PUT `/api/transactions/{id}`

```bash
curl -X PUT "http://localhost:8080/api/transactions/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"accountId":1,"occurredAt":"2026-10-16T12:00:00","amount":30.00,"description":"Updated lunch","transactionType":"EXPENSE","categoryIds":[1]}'
```

### Delete transaction — DELETE `/api/transactions/{id}`

```bash
curl -X DELETE "http://localhost:8080/api/transactions/1" \
  -H "Authorization: Bearer $TOKEN"
```

**Note:** Transaction filtering and pagination are currently handled in the frontend; the GET controller does not accept filtering or pagination parameters.

## Budgets — `/api/budgets`

| Method | Endpoint | Purpose | Auth | Success |
|---|---|---|---|---|
| `POST` | `/api/budgets` | Create budget | Yes | `201` |
| `GET` | `/api/budgets` | List budgets | Yes | `200` |
| `PUT` | `/api/budgets/{id}` | Update budget | Yes | `200` |
| `DELETE` | `/api/budgets/{id}` | Delete budget | Yes | `204` |

### Create budget — POST `/api/budgets`

Use an existing category ID. Supported periods are `NONE`, `MONTHLY`, `QUARTERLY`, and `YEARLY`.

```bash
curl -X POST "http://localhost:8080/api/budgets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"budgetName":"Groceries Budget","categoryId":1,"spendingLimit":400.00,"timePeriod":"MONTHLY","budgetStatus":true}'
```

### List budgets — GET `/api/budgets`

```bash
curl -X GET "http://localhost:8080/api/budgets" \
  -H "Authorization: Bearer $TOKEN"
```

### Update budget — PUT `/api/budgets/{id}`

```bash
curl -X PUT "http://localhost:8080/api/budgets/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"budgetName":"Groceries Budget","categoryId":1,"spendingLimit":500.00,"timePeriod":"MONTHLY","budgetStatus":true}'
```

### Delete budget — DELETE `/api/budgets/{id}`

```bash
curl -X DELETE "http://localhost:8080/api/budgets/1" \
  -H "Authorization: Bearer $TOKEN"
```

## Status codes and errors

The controllers explicitly return the following success codes:

| Code | Meaning | Typical use in this API |
|---|---|---|
| `200 OK` | Request succeeded | Login, list, profile, and update operations |
| `201 Created` | Resource created | Registration and resource creation |
| `204 No Content` | Request succeeded without a response body | Logout and delete operations |

Validation failures, missing resources, and invalid or missing tokens may result in error responses. **Exact error status codes and JSON shapes depend on the service exceptions and global exception handlers**, which are not defined in the controller source provided for this document.

## Implementation notes

- Protected controllers read the `Authorization` header and call `AuthTokenService.validateToken(...)` to identify the current user.
- Tokens are generated at login and managed in backend memory rather than persisted to the database.
- The controllers shown do not expose individual `GET /{id}` routes, dedicated reports routes, recurring-transaction routes, or notification routes.
- JSON request property names were verified against the uploaded DTO classes. Examples have not been executed against a running backend.
- `UpdateAccountRequest` accepts only `accountName` and `accountType`; balance changes happen through transactions, not the account update endpoint.
- `UpdateUserProfileRequest` also accepts `email` and `password`, in addition to the name and phone fields shown in the sample.
- `BudgetResponse` includes calculated `spentAmount`, `remainingAmount`, and `percentageUsed` values.
- `TransactionResponse` includes `categoryIds` and `accountName`; `LoginResponse` returns `token` and `userId`.

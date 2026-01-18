# Task Management Backend API

A Trello-style Task Management Backend API built with NestJS, PostgreSQL, and JWT Authentication.

## 📋 Table of Contents

- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Testing with Postman](#testing-with-postman)
- [API Endpoints](#api-endpoints)
- [Swagger Documentation](#swagger-documentation)

---

## 🚀 Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env file (see Environment Variables section below)
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=TaskManagement
DB_SYNCHRONIZE=false
DB_LOGGING=true
JWT_SECRET=your_jwt_secret_key_here
PORT=3000
```

**Note:** Make sure your PostgreSQL database exists and matches `DB_DATABASE`.

---

## ▶️ Running the Application

```bash
# Development mode (with hot-reload)
npm run start:dev

# Production mode
npm run start:prod

# Standard start
npm run start
```

The application will start on `http://localhost:3000` (or the PORT specified in .env).

---

## 📬 Testing with Postman

### Step 1: Setup Postman Collection

1. Open **Postman**
2. Create a new **Collection** (name: "Task Management API")
3. Set base URL as environment variable:
   - Click on **Environments** (left sidebar)
   - Create new environment: "Local Development"
   - Add variable:
     - **Variable:** `base_url`
     - **Initial Value:** `http://localhost:3000`
     - Click **Save**

### Step 2: Authentication Setup

**Important:** Most endpoints require JWT Bearer Token authentication.

#### A. Register a New User

1. Create new request in Postman:
   - **Method:** `POST`
   - **URL:** `{{base_url}}/auth/register`
   - **Headers:** 
     - `Content-Type: application/json`
   - **Body (raw JSON):**
     ```json
     {
       "name": "John Doe",
       "email": "john@example.com",
       "password": "Password123",
       "avatar_url": "https://example.com/avatar.jpg"
     }
     ```
   - Click **Send**

   **Response Example:**
   ```json
   {
     "success": true,
     "message": "User registered successfully",
     "data": {
       "user": {
         "id": "uuid",
         "name": "John Doe",
         "email": "john@example.com"
       },
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     }
   }
   ```

#### B. Login

1. Create new request:
   - **Method:** `POST`
   - **URL:** `{{base_url}}/auth/login`
   - **Headers:**
     - `Content-Type: application/json`
   - **Body (raw JSON):**
     ```json
     {
       "email": "john@example.com",
       "password": "Password123"
     }
     ```
   - Click **Send**

   **Response Example:**
   ```json
   {
     "success": true,
     "message": "Login successful",
     "data": {
       "user": { ... },
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     }
   }
   ```

#### C. Save JWT Token in Environment

1. Copy the `token` from login/register response
2. Go to **Environments** → Your environment
3. Add variable:
   - **Variable:** `token`
   - **Initial Value:** (paste your token here)
   - Click **Save**

#### D. Setup Authorization for All Requests

**Option 1: Collection-level Authorization (Recommended)**

1. Right-click on your Collection
2. Select **Edit**
3. Go to **Authorization** tab
4. **Type:** Bearer Token
5. **Token:** `{{token}}`
6. Click **Update**

Now all requests in the collection will automatically use the token!

**Option 2: Per-Request Authorization**

For individual requests:
- Go to **Authorization** tab
- **Type:** Bearer Token
- **Token:** `{{token}}` (or paste token directly)

---

## 📍 API Endpoints

### 🔐 Authentication Endpoints

#### 1. Register User
```
POST /auth/register
Content-Type: application/json

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "avatar_url": "https://example.com/avatar.jpg" (optional)
}
```

#### 2. Login
```
POST /auth/login
Content-Type: application/json

Body:
{
  "email": "john@example.com",
  "password": "Password123"
}
```

---

### 📋 Board Endpoints

**All board endpoints require Bearer Token authentication.**

#### 1. Create Board
```
POST /boards
Authorization: Bearer {{token}}
Content-Type: application/json

Body:
{
  "title": "My Project Board"
}
```

#### 2. Get All Boards (for logged-in user)
```
GET /boards
Authorization: Bearer {{token}}
```

#### 3. Get Board by ID
```
GET /boards/:id
Authorization: Bearer {{token}}

Example: GET /boards/123e4567-e89b-12d3-a456-426614174000
```

#### 4. Delete Board (OWNER only)
```
DELETE /boards/:id
Authorization: Bearer {{token}}

Example: DELETE /boards/123e4567-e89b-12d3-a456-426614174000
```

---

### 👥 Board Members Endpoints

**All endpoints require Bearer Token and user must be a board member.**

#### 1. Add Member to Board (OWNER only)
```
POST /boards/:boardId/members
Authorization: Bearer {{token}}
Content-Type: application/json

Body:
{
  "email": "member@example.com",
  "role": "MEMBER" (optional, default: "MEMBER")
}

Example: POST /boards/123e4567-e89b-12d3-a456-426614174000/members
```

#### 2. Get All Board Members
```
GET /boards/:boardId/members
Authorization: Bearer {{token}}

Example: GET /boards/123e4567-e89b-12d3-a456-426614174000/members
```

---

### 📊 Column Endpoints

**All endpoints require Bearer Token and user must be a board member.**

#### 1. Create Column
```
POST /columns
Authorization: Bearer {{token}}
Content-Type: application/json

Body:
{
  "title": "To Do",
  "position": 0,
  "board_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

#### 2. Get All Columns for a Board
```
GET /boards/:boardId/columns
Authorization: Bearer {{token}}

Example: GET /boards/123e4567-e89b-12d3-a456-426614174000/columns
```

#### 3. Update Column (rename/reorder)
```
PATCH /columns/:id
Authorization: Bearer {{token}}
Content-Type: application/json

Body:
{
  "title": "In Progress" (optional),
  "position": 1 (optional)
}

Example: PATCH /columns/123e4567-e89b-12d3-a456-426614174000
```

---

### ✅ Task Endpoints

**All endpoints require Bearer Token and user must be a board member.**

#### 1. Create Task
```
POST /tasks
Authorization: Bearer {{token}}
Content-Type: application/json

Body:
{
  "title": "Complete project documentation",
  "description": "Write comprehensive README",
  "column_id": "123e4567-e89b-12d3-a456-426614174000",
  "board_id": "123e4567-e89b-12d3-a456-426614174000",
  "position": 0
}
```

#### 2. Get All Tasks for a Board
```
GET /boards/:boardId/tasks
Authorization: Bearer {{token}}

Example: GET /boards/123e4567-e89b-12d3-a456-426614174000/tasks
```

#### 3. Update Task (supports drag & drop)
```
PATCH /tasks/:id
Authorization: Bearer {{token}}
Content-Type: application/json

Body (all fields optional):
{
  "title": "Updated task title",
  "description": "Updated description",
  "status": "IN_PROGRESS" (options: "TODO", "IN_PROGRESS", "DONE"),
  "column_id": "new-column-id",
  "position": 2
}

Example: PATCH /tasks/123e4567-e89b-12d3-a456-426614174000
```

#### 4. Delete Task (OWNER only)
```
DELETE /tasks/:id
Authorization: Bearer {{token}}

Example: DELETE /tasks/123e4567-e89b-12d3-a456-426614174000
```

---

## 🎯 Complete Testing Workflow in Postman

### Step-by-Step Guide:

1. **Start the server**
   ```bash
   npm run start:dev
   ```

2. **Register a user**
   - POST `/auth/register`
   - Copy the `token` from response

3. **Set token in Postman environment**
   - Add `token` variable with the JWT token value

4. **Create a Board**
   - POST `/boards`
   - Copy the board `id` from response

5. **Get all boards**
   - GET `/boards`
   - Verify your board is in the list

6. **Add a member to board**
   - POST `/boards/:boardId/members`
   - Use another user's email

7. **Create columns**
   - POST `/columns` (repeat for "To Do", "In Progress", "Done")

8. **Get columns for board**
   - GET `/boards/:boardId/columns`
   - Copy column IDs

9. **Create tasks**
   - POST `/tasks`
   - Use board_id and column_id from previous steps

10. **Get all tasks**
    - GET `/boards/:boardId/tasks`

11. **Update task (drag & drop simulation)**
    - PATCH `/tasks/:id`
    - Change `column_id` and `position` to move task

12. **Delete task**
    - DELETE `/tasks/:id`

---

## 📚 Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

---

## 🔒 Authentication & Authorization

- **JWT Bearer Token:** Required for all protected endpoints
- **Token Format:** `Bearer <token>` in Authorization header
- **Token Expiration:** Set in JWT configuration
- **Board Access:** Users must be board members to access board-related endpoints
- **Owner Privileges:** Only board owners can delete boards, add members, and delete tasks

---

## 📖 Swagger Documentation

Once the server is running, access Swagger UI at:

```
http://localhost:3000/api
```

Swagger provides interactive API documentation where you can:
- See all endpoints
- View request/response schemas
- Test endpoints directly in the browser
- Share API documentation with your team

---

## 🛠️ Common Issues & Solutions

### Issue: "Unauthorized" or 401 Error
**Solution:** Make sure you're including the Bearer token in the Authorization header.

### Issue: "Forbidden" or 403 Error
**Solution:** 
- Check if you're a member of the board
- For owner-only operations, verify you're the board owner

### Issue: "Board not found" or "Column not found"
**Solution:** Double-check the IDs in your requests. They must be valid UUIDs.

### Issue: "Database connection error"
**Solution:** 
- Verify PostgreSQL is running
- Check `.env` database credentials
- Ensure database exists

---

## 📝 Notes

- All IDs are UUIDs (Universally Unique Identifiers)
- Task status can be: `TODO`, `IN_PROGRESS`, or `DONE`
- Board roles: `OWNER` or `MEMBER`
- Position values are integers (0-based indexing)
- All timestamps are in ISO 8601 format

---

## 🤝 Support

For issues or questions:
- Check Swagger documentation: `http://localhost:3000/api`
- Review error messages in API responses
- Check server logs for detailed error information

---

**Happy Testing! 🚀**

# EventHub – Authentication Backend

Complete Node.js / Express / MongoDB authentication backend for the EventHub platform.

---

## Folder Structure

```
eventhub-backend/
├── config/
│   └── db.js                 ← MongoDB connection setup
├── controllers/
│   └── authController.js     ← Signup, Login, GetMe logic
├── middleware/
│   └── authMiddleware.js     ← JWT protect + role-based access
├── models/
│   └── User.js               ← User schema with 4 roles
├── routes/
│   └── authRoutes.js         ← Auth route definitions
├── utils/
│   └── generateToken.js      ← JWT token generator
├── .env.example              ← Environment variable template
├── .gitignore
├── package.json
└── server.js                 ← Express app entry point
```

---

## Prerequisites

- **Node.js** v18 or higher → https://nodejs.org
- **MongoDB** running locally on port 27017, OR a free MongoDB Atlas cluster

---

## Setup in VS Code

### Step 1 – Open the backend folder

```
File → Open Folder → select eventhub-backend/
```

### Step 2 – Create your .env file

In the VS Code terminal (`Ctrl + `` ` ``):

```bash
cp .env.example .env
```

Open `.env` and update the values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/eventhub
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
```

> **Tip:** For `JWT_SECRET`, use something like: `openssl rand -base64 64`

### Step 3 – Install dependencies

```bash
npm install
```

### Step 4 – Start the server

```bash
# Development (auto-restarts on file changes)
npm run dev

# OR production
npm start
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 EventHub server running on http://localhost:5000
   Environment: development
```

---

## API Endpoints

### Base URL: `http://localhost:5000/api/auth`

| Method | Route     | Access    | Description              |
|--------|-----------|-----------|--------------------------|
| POST   | /signup   | Public    | Register a new user      |
| POST   | /login    | Public    | Login and receive JWT    |
| GET    | /me       | Protected | Get current user profile |

---

## API Usage Examples

### POST /api/auth/signup

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123",
  "role": "Photographer"
}
```

**Available roles on signup:** `Photographer`, `Club Member`, `Viewer`
> `Admin` role must be assigned manually in MongoDB for security.

**Success Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "_id": "665abc123...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "Photographer",
    "avatar": "",
    "bio": "",
    "isActive": true,
    "lastLogin": null,
    "createdAt": "2024-06-01T10:00:00.000Z",
    "updatedAt": "2024-06-01T10:00:00.000Z"
  }
}
```

---

### POST /api/auth/login

**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged in successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": { ... }
}
```

---

### GET /api/auth/me

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "user": { ... }
}
```

---

## Connecting Frontend to Backend

In your React frontend, store the token after login/signup:

```js
// After successful login API call:
localStorage.setItem("token", response.data.token);

// Send token with every protected request:
const token = localStorage.getItem("token");

fetch("http://localhost:5000/api/auth/me", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

---

## User Roles

| Role          | Intended Access Level                        |
|---------------|----------------------------------------------|
| Admin         | Full access to all features                  |
| Photographer  | Upload, manage, and watermark their photos   |
| Club Member   | View events, upload limited media            |
| Viewer        | Read-only access to public content           |

---

## How to Assign Admin Role

After a user signs up, run this in **MongoDB Compass** or **mongosh**:

```js
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "Admin" } }
)
```

---

## Environment Variables Reference

| Variable       | Description                          | Example                    |
|----------------|--------------------------------------|----------------------------|
| PORT           | Server port                          | 5000                       |
| NODE_ENV       | Environment mode                     | development / production   |
| MONGO_URI      | MongoDB connection string            | mongodb://localhost:27017/eventhub |
| JWT_SECRET     | Secret key for signing JWTs          | a long random string       |
| JWT_EXPIRES_IN | Token expiry duration                | 7d                         |

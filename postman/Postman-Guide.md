h# 📮 Postman API Testing Guide - Lost & Found System

## 🚀 Step-by-Step Guide to Validate RESTful APIs

### Prerequisites
1. **Install Postman**: Download from [postman.com](https://www.postman.com/downloads/)
2. **Start the Server**: Make sure your backend server is running on `http://localhost:5000`
3. **Import Collection**: Import the `Lost-Found-API.postman_collection.json` file

---

## 📋 Table of Contents
1. [Setup Environment](#setup-environment)
2. [API 1: User Registration](#api-1-user-registration)
3. [API 2: User Login](#api-2-user-login)
4. [API 3: Get All Lost & Found Items](#api-3-get-all-lost--found-items)
5. [API 4: Add Lost Item](#api-4-add-lost-item)
6. [API 5: Mark Item as Claimed](#api-5-mark-item-as-claimed)

---

## 🌍 Setup Environment

### Step 1: Create Environment Variables
1. Click on **"Environments"** in the left sidebar
2. Click **"+"** to create a new environment
3. Name it **"Lost-Found Local"**
4. Add these variables:
   - `base_url` = `http://localhost:5000`
   - `auth_token` = (leave empty - will be auto-filled after login)
   - `admin_token` = (leave empty - will be auto-filled after admin login)
   - `item_id` = (leave empty - will be auto-filled after creating item)

5. Click **"Save"**
6. Select the environment from the dropdown in top-right corner

---

## 📝 API 1: User Registration

### Method: `POST`

### Endpoint:
```
{{base_url}}/api/auth/register
```
Or full URL:
```
http://localhost:5000/api/auth/register
```

### Headers:
```
Content-Type: application/json
```

### Request Body (JSON):
```json
{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "Password123"
}
```

### Step-by-Step Instructions:

1. **Create New Request**:
   - Click **"New"** → **"HTTP Request"**
   - Name it: `Register User`

2. **Set Method**:
   - Select **POST** from the dropdown

3. **Enter URL**:
   - Type: `{{base_url}}/api/auth/register`
   - Or use: `http://localhost:5000/api/auth/register`

4. **Set Headers**:
   - Go to **"Headers"** tab
   - Add:
     - **Key**: `Content-Type`
     - **Value**: `application/json`

5. **Set Body**:
   - Go to **"Body"** tab
   - Select **"raw"**
   - Select **"JSON"** from dropdown
   - Paste the JSON body above

6. **Add Tests (Optional but Recommended)**:
   - Go to **"Tests"** tab
   - Paste this script:
   ```javascript
   pm.test("Status code is 201", function () {
       pm.response.to.have.status(201);
   });

   pm.test("Response has token", function () {
       var jsonData = pm.response.json();
       pm.expect(jsonData).to.have.property('token');
       pm.environment.set("auth_token", jsonData.token);
   });

   pm.test("Response has user data", function () {
       var jsonData = pm.response.json();
       pm.expect(jsonData).to.have.property('user');
       pm.expect(jsonData.user).to.have.property('id');
       pm.expect(jsonData.user).to.have.property('email');
       pm.expect(jsonData.user.role).to.eql('student');
   });
   ```

7. **Send Request**:
   - Click **"Send"** button
   - Check the response (should be 201 Created)
   - The `auth_token` will be automatically saved to environment

### Expected Response:
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "student"
    }
}
```

---

## 🔐 API 2: User Login

### Method: `POST`

### Endpoint:
```
{{base_url}}/api/auth/login
```
Or full URL:
```
http://localhost:5000/api/auth/login
```

### Headers:
```
Content-Type: application/json
```

### Request Body (JSON):
```json
{
    "email": "john.doe@example.com",
    "password": "Password123"
}
```

### Step-by-Step Instructions:

1. **Create New Request**:
   - Click **"New"** → **"HTTP Request"**
   - Name it: `Login User`

2. **Set Method**: **POST**

3. **Enter URL**: `{{base_url}}/api/auth/login`

4. **Set Headers**:
   - **Key**: `Content-Type`
   - **Value**: `application/json`

5. **Set Body**:
   - **Body** tab → **raw** → **JSON**
   - Paste the JSON body above

6. **Add Tests**:
   - **Tests** tab
   - Paste:
   ```javascript
   pm.test("Status code is 200", function () {
       pm.response.to.have.status(200);
   });

   pm.test("Response has token", function () {
       var jsonData = pm.response.json();
       pm.expect(jsonData).to.have.property('token');
       pm.environment.set("auth_token", jsonData.token);
   });

   pm.test("Response has user data", function () {
       var jsonData = pm.response.json();
       pm.expect(jsonData).to.have.property('user');
       pm.expect(jsonData.user).to.have.property('email');
       pm.expect(jsonData.user).to.have.property('role');
   });

   pm.test("Response time is less than 1000ms", function () {
       pm.expect(pm.response.responseTime).to.be.below(1000);
   });
   ```

7. **Send Request**: Click **"Send"**

### Expected Response:
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "student"
    }
}
```

### Admin Login (Alternative):
Use this body for admin login:
```json
{
    "email": "admin@gmail.com",
    "password": "admin123"
}
```

---

## 📦 API 3: Get All Lost & Found Items

### Method: `GET`

### Endpoint:
```
{{base_url}}/api/lost-found
```

### Headers:
```
None required (Public endpoint)
```

### Step-by-Step Instructions:

1. **Create New Request**: Name it `Get All Items`

2. **Set Method**: **GET**

3. **Enter URL**: `{{base_url}}/api/lost-found`

4. **No Headers Needed** (This is a public endpoint)

5. **No Body Needed** (GET request)

6. **Add Tests**:
   ```javascript
   pm.test("Status code is 200", function () {
       pm.response.to.have.status(200);
   });

   pm.test("Response is an array", function () {
       var jsonData = pm.response.json();
       pm.expect(jsonData).to.be.an('array');
   });

   pm.test("Response time is less than 1000ms", function () {
       pm.expect(pm.response.responseTime).to.be.below(1000);
   });
   ```

7. **Send Request**: Click **"Send"**

### Expected Response:
```json
[
    {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Lost iPhone 13",
        "description": "I lost my iPhone...",
        "type": "lost",
        "location": "Main Library",
        "date": "2024-01-15T10:30:00.000Z",
        "contact": "john@example.com",
        "imageUrl": "",
        "reportedBy": "507f191e810c19729de860ea",
        "claimed": false,
        "createdAt": "2024-01-15T10:35:00.000Z",
        "updatedAt": "2024-01-15T10:35:00.000Z"
    }
]
```

---

## ➕ API 4: Add Lost Item

### Method: `POST`

### Endpoint:
```
{{base_url}}/api/lost-found
```

### Headers:
```
Content-Type: application/json
Authorization: Bearer {{auth_token}}
```

### Request Body (JSON):
```json
{
    "title": "Lost iPhone 13",
    "description": "I lost my iPhone 13 Pro Max near the library. It has a black case with a red sticker on the back.",
    "type": "lost",
    "location": "Main Library, Building A",
    "date": "2024-01-15T10:30:00.000Z",
    "contact": "john.doe@example.com",
    "imageUrl": "https://example.com/images/iphone.jpg"
}
```

### Step-by-Step Instructions:

1. **Create New Request**: Name it `Add Lost Item`

2. **Set Method**: **POST**

3. **Enter URL**: `{{base_url}}/api/lost-found`

4. **Set Headers**:
   - **Key**: `Content-Type` → **Value**: `application/json`
   - **Key**: `Authorization` → **Value**: `Bearer {{auth_token}}`
   
   **OR** use Postman's built-in auth:
   - Go to **"Authorization"** tab
   - Type: **Bearer Token**
   - Token: `{{auth_token}}`

5. **Set Body**:
   - **Body** tab → **raw** → **JSON**
   - Paste the JSON body above

6. **Add Pre-request Script** (Optional):
   - Go to **"Pre-request Script"** tab
   ```javascript
   // Ensure token is set
   if (!pm.environment.get("auth_token")) {
       console.log("Warning: auth_token not set. Please login first.");
   }
   ```

7. **Add Tests**:
   ```javascript
   pm.test("Status code is 201", function () {
       pm.response.to.have.status(201);
   });

   pm.test("Response has item data", function () {
       var jsonData = pm.response.json();
       pm.expect(jsonData).to.have.property('_id');
       pm.expect(jsonData).to.have.property('title');
       pm.expect(jsonData).to.have.property('type');
       pm.expect(jsonData.type).to.eql('lost');
       pm.environment.set("item_id", jsonData._id);
   });

   pm.test("Response has required fields", function () {
       var jsonData = pm.response.json();
       pm.expect(jsonData).to.have.property('location');
       pm.expect(jsonData).to.have.property('description');
       pm.expect(jsonData).to.have.property('contact');
   });
   ```

8. **Send Request**: Click **"Send"**

### Expected Response:
```json
{
    "_id": "507f1f77bcf86cd799439012",
    "title": "Lost iPhone 13",
    "description": "I lost my iPhone 13 Pro Max near the library...",
    "type": "lost",
    "location": "Main Library, Building A",
    "date": "2024-01-15T10:30:00.000Z",
    "contact": "john.doe@example.com",
    "imageUrl": "https://example.com/images/iphone.jpg",
    "reportedBy": "507f1f77bcf86cd799439011",
    "claimed": false,
    "createdAt": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
}
```

---

## ✅ API 5: Mark Item as Claimed

### Method: `POST`

### Endpoint:
```
{{base_url}}/api/lost-found/{{item_id}}/mark-claimed
```

### Headers:
```
Content-Type: application/json
Authorization: Bearer {{auth_token}}
```

### Request Body (JSON):
```json
{
    "userId": "{{user_id}}"
}
```

**Note**: Replace `{{item_id}}` with the actual item ID (can be saved from previous request)

### Step-by-Step Instructions:

1. **Create New Request**: Name it `Mark Item as Claimed`

2. **Set Method**: **POST**

3. **Enter URL**: 
   - `{{base_url}}/api/lost-found/{{item_id}}/mark-claimed`
   - Or manually: `http://localhost:5000/api/lost-found/507f1f77bcf86cd799439012/mark-claimed`

4. **Set Authorization**:
   - **Authorization** tab → **Bearer Token** → `{{auth_token}}`

5. **Set Headers**:
   - **Content-Type**: `application/json`

6. **Set Body**:
   ```json
   {
       "userId": "507f1f77bcf86cd799439011"
   }
   ```
   Or use environment variable:
   ```json
   {
       "userId": "{{user_id}}"
   }
   ```

7. **Add Tests**:
   ```javascript
   pm.test("Status code is 200", function () {
       pm.response.to.have.status(200);
   });

   pm.test("Item marked as claimed", function () {
       var jsonData = pm.response.json();
       pm.expect(jsonData.success).to.be.true;
       pm.expect(jsonData.claimed).to.be.true;
   });
   ```

8. **Send Request**: Click **"Send"**

### Expected Response:
```json
{
    "success": true,
    "message": "Item marked as claimed successfully",
    "claimed": true,
    "claimedAt": "2024-01-15T12:30:00.000Z"
}
```

---

## 🔧 Additional Tips

### Testing Different Scenarios:

1. **Test Validation Errors**:
   - Try sending incomplete data
   - Try invalid email format
   - Try weak password (should fail validation)

2. **Test Authentication**:
   - Try accessing protected routes without token
   - Try with expired/invalid token
   - Should get 401 Unauthorized

3. **Test Rate Limiting**:
   - Send multiple login requests quickly
   - Should eventually get rate limit error

4. **Test Admin Routes**:
   - Login as admin
   - Use `{{admin_token}}` for admin-only routes

### Common Issues:

- **401 Unauthorized**: Token missing or expired - Login again
- **403 Forbidden**: Wrong role (e.g., student trying admin route)
- **400 Bad Request**: Validation error - Check request body
- **404 Not Found**: Wrong endpoint or item ID doesn't exist

---

## 📊 Collection Runner

To run all tests at once:

1. Click on **"Collections"** in sidebar
2. Select **"Lost & Found API"** collection
3. Click **"Run"** button
4. Select requests to run
5. Click **"Run Lost-Found-API"**
6. View test results

---

## 🎯 Summary

You've learned how to:
- ✅ Set up Postman environment
- ✅ Test User Registration API
- ✅ Test User Login API
- ✅ Test Get All Items API
- ✅ Test Add Item API (with authentication)
- ✅ Test Mark Item as Claimed API
- ✅ Add validation tests
- ✅ Use environment variables
- ✅ Handle authentication tokens

Happy Testing! 🚀


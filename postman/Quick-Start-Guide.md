# 🚀 Quick Start Guide - Testing APIs in Postman

## ⚡ Quick Setup (2 minutes)

### Step 1: Import Collection
1. Open Postman
2. Click **"Import"** button (top-left)
3. Select `Lost-Found-API.postman_collection.json` file
4. Click **"Import"**

### Step 2: Create Environment
1. Click **"Environments"** → **"+"**
2. Name: `Lost-Found Local`
3. Add variable:
   - **Variable**: `base_url`
   - **Initial Value**: `http://localhost:5000`
   - **Current Value**: `http://localhost:5000`
4. Click **"Save"**
5. Select environment from dropdown (top-right)

---

## 📋 API 1: User Login (POST)

### 🔧 Configuration

**Method:** `POST`

**URL:** `http://localhost:5000/api/auth/login`

**Headers Tab:**
```
Content-Type: application/json
```

**Body Tab:**
- Select: **"raw"**
- Select: **"JSON"**
- Paste:
```json
{
    "email": "admin@gmail.com",
    "password": "admin123"
}
```

**Tests Tab (Paste this script):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has token", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('token');
    pm.environment.set("auth_token", jsonData.token);
});

pm.test("User is admin", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.user.role).to.eql('admin');
});
```

**Click "Send"** → Token saved automatically! ✅

---

## 📋 API 2: Get All Items (GET)

### 🔧 Configuration

**Method:** `GET`

**URL:** `http://localhost:5000/api/lost-found`

**Headers Tab:** *(None needed - Public endpoint)*

**Body Tab:** *(None needed - GET request)*

**Tests Tab (Paste this script):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is an array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
});

pm.test("Response time is fast", function () {
    pm.expect(pm.response.responseTime).to.be.below(1000);
});
```

**Click "Send"** → See all items! ✅

---

## 📋 API 3: Add Lost Item (POST - Protected)

### 🔧 Configuration

**Method:** `POST`

**URL:** `http://localhost:5000/api/lost-found`

**Authorization Tab:**
- Type: **"Bearer Token"**
- Token: `{{auth_token}}`
  *(This will use the token saved from Login API)*

**Headers Tab:**
```
Content-Type: application/json
```

**Body Tab:**
- Select: **"raw"**
- Select: **"JSON"**
- Paste:
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

**Tests Tab (Paste this script):**
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Response has item data", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('_id');
    pm.expect(jsonData).to.have.property('title');
    pm.expect(jsonData.type).to.eql('lost');
    pm.environment.set("item_id", jsonData._id);
});

pm.test("Item has all required fields", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('location');
    pm.expect(jsonData).to.have.property('description');
    pm.expect(jsonData).to.have.property('contact');
});
```

**Click "Send"** → Item created! ✅

---

## 🎯 Visual Checklist

### For API 1 (Login):
- [ ] Method: POST
- [ ] URL: `/api/auth/login`
- [ ] Headers: Content-Type: application/json
- [ ] Body: JSON with email and password
- [ ] Tests: Status 200, token exists, save token

### For API 2 (Get Items):
- [ ] Method: GET
- [ ] URL: `/api/lost-found`
- [ ] Headers: None
- [ ] Body: None
- [ ] Tests: Status 200, array response, fast response

### For API 3 (Add Item):
- [ ] Method: POST
- [ ] URL: `/api/lost-found`
- [ ] Authorization: Bearer Token `{{auth_token}}`
- [ ] Headers: Content-Type: application/json
- [ ] Body: JSON with all item fields
- [ ] Tests: Status 201, item created, save item_id

---

## 💡 Pro Tips

1. **Token Management**: Login first, token auto-saves to `{{auth_token}}`
2. **Environment Variables**: Use `{{base_url}}` instead of typing full URL
3. **Run Tests**: Always add tests to verify API responses
4. **Collection Runner**: Run all APIs in sequence using Collection Runner
5. **Save Responses**: Save successful responses as examples

---

## 🐛 Common Errors & Solutions

| Error | Solution |
|-------|----------|
| **401 Unauthorized** | Login first to get token |
| **403 Forbidden** | Use admin token for admin routes |
| **400 Bad Request** | Check JSON body format |
| **404 Not Found** | Verify URL and server is running |
| **500 Server Error** | Check server logs |

---

## 📊 Expected Responses

### Login Success:
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "...",
        "name": "Admin",
        "email": "admin@gmail.com",
        "role": "admin"
    }
}
```

### Get Items Success:
```json
[
    {
        "_id": "...",
        "title": "Lost iPhone",
        "type": "lost",
        ...
    }
]
```

### Add Item Success:
```json
{
    "_id": "...",
    "title": "Lost iPhone 13",
    "type": "lost",
    "createdAt": "...",
    ...
}
```

---

That's it! Start with API 1 (Login), then API 2 (Get Items), then API 3 (Add Item). Happy Testing! 🎉


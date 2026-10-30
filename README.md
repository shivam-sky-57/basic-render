# Simple Node & MongoDB Project for Render

A basic, lightweight Node.js + Express + MongoDB project with 3 pages/endpoints, ready for 1-click deployment on [Render](https://render.com).

---

## 📄 Pages & Endpoints

| URL | Type | Description |
|---|---|---|
| **`/`** | HTML | **Main Page** with project info, MongoDB connection status, and navigation links. |
| **`/health`** | HTML / JSON | **Health Check** page showing server uptime, status, and database connection. Render uses this to ensure your service is live. |
| **`/content`** | HTML Table | **Country Timetable** showing a clean HTML table of Country, Capital, Latitude, and Longitude. |

> **Tip:** You can also get raw JSON at `/content?format=json`.

---

## 📁 File Structure

```
d:/Render/
├── package.json          # Simple dependencies & start script
├── render.yaml           # Render deployment configuration
├── .env.example          # Environment variables template
├── .env                  # Local environment file (paste your MONGO_URI here)
├── .gitignore            # Excludes node_modules and .env
└── server/
    ├── server.js         # Main Express server serving /, /health, and /content
    ├── seedData.js       # Hardcoded country timetable data
    └── models/
        └── Country.js    # Mongoose model for MongoDB
```

---

## 🚀 How to Deploy on Render (Step-by-Step)

### Step 1: Push Code to GitHub
Open your terminal in this project folder and run:
```bash
git init
git add .
git commit -m "Simple Node MongoDB project"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

### Step 2: Create a Web Service on Render
1. Go to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** → select **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect your GitHub repository.

### Step 3: Configure Settings
Fill in these simple fields:
- **Name:** `simple-node-mongo-app` (or any name)
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `node server/server.js`
- **Instance Type:** `Free`

### Step 4: Add MongoDB URL Environment Variable
Under **Environment Variables**, click **Add Environment Variable**:
- **Key:** `MONGO_URI`
- **Value:** `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/dbname?retryWrites=true&w=majority`

### Step 5: (Optional) Set Health Check Path
Under **Advanced**:
- **Health Check Path:** `/health`

### Step 6: Click "Deploy Web Service"
Render will install dependencies, launch your server, connect to MongoDB, seed the table, and give you your live URL (e.g. `https://simple-node-mongo-app.onrender.com`).

---

## 💻 Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Add your MongoDB URL in `.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://...
   ```

3. Start server:
   ```bash
   npm start
   ```

4. Open in browser:
   - Main Page: `http://localhost:5000/`
   - Health Page: `http://localhost:5000/health`
   - Content Table: `http://localhost:5000/content`

# Vercel Deployment Guide: Intelligent Department Workflow Automation Agent

This repository is pre-configured for deployment on **Vercel** as a unified full-stack application (React frontend + Express Serverless API functions).

---

## ⚡ What We Have Configured for Vercel

1. **`vercel.json`**:
   - Compiles the React + Tailwind frontend using `npm run build` into `frontend/dist`.
   - Routes all `/api/*` and `/uploads/*` requests to the serverless function `api/index.js`.
   - Rewrites client-side page routes (`/dashboard`, `/login`, `/history`, `/admin/*`) to `/index.html` to prevent 404 errors on browser refresh.
2. **Serverless Connection Pooling ([`backend/config/db.js`](file:///c:/Users/altha/Downloads/New%20folder/backend/config/db.js))**:
   - Caches MongoDB connection promises across serverless cold and warm starts.
3. **Serverless File Uploads ([`backend/middleware/upload.js`](file:///c:/Users/altha/Downloads/New%20folder/backend/middleware/upload.js))**:
   - Automatically directs document uploads to `/tmp/uploads` on Vercel.
4. **Auto-Seed on First Launch ([`api/index.js`](file:///c:/Users/altha/Downloads/New%20folder/api/index.js))**:
   - Automatically seeds institutional demo accounts, departments, and workflow rules when connected to a fresh database.

---

## 🍃 Step 1: Set Up Free Cloud MongoDB (MongoDB Atlas)

Since Vercel Serverless Functions are stateless and ephemeral, an external cloud MongoDB instance is required. MongoDB Atlas provides a **100% forever-free (M0) tier**:

1. Go to **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)** and sign up or log in.
2. Click **Create Deployment** $\rightarrow$ select the **M0 Free** cluster.
3. **Database Access:**
   - Create a database user with username (e.g. `app_admin`) and a secure password.
4. **Network Access:**
   - Go to **Network Access** in the left sidebar $\rightarrow$ click **Add IP Address** $\rightarrow$ select **Allow Access from Anywhere** (`0.0.0.0/0`). This ensures Vercel's distributed serverless functions can connect.
5. **Get Connection String:**
   - Go to **Database** $\rightarrow$ click **Connect** $\rightarrow$ choose **Drivers (Node.js)**.
   - Copy the connection string. It will look like:
     ```
     mongodb+srv://app_admin:<password>@cluster0.abcde.mongodb.net/workflow_automation?retryWrites=true&w=majority
     ```
   - Replace `<password>` with the password you set.

---

## 🚀 Step 2: Deploy to Vercel

### Method A: Deploy via GitHub (Recommended & Easiest)

1. **Initialize Git & Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Deploy Intelligent Department Workflow Automation Agent"
   git branch -M main
   # Create a repository on github.com, then link and push:
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. **Import into Vercel:**
   - Open your browser to **[Vercel Dashboard](https://vercel.com/new)**.
   - Click **Import** next to your GitHub repository.

3. **Configure Environment Variables:**
   Under **Environment Variables**, add:

   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI from Step 1 |
   | `JWT_SECRET` | `super_secret_workflow_key_2026_xyz` | Any secure random string (32+ characters) |

4. **Click "Deploy":**
   - Vercel will install dependencies, build the frontend with Vite, package the serverless API functions, and provide you with a live `.vercel.app` URL!

---

### Method B: Deploy via Vercel CLI (From Terminal)

The Vercel CLI is already installed on your system.

1. **Sign in to Vercel in Terminal:**
   ```bash
   vercel login
   ```
   Follow the prompt in your browser to approve the login.

2. **Link & Deploy:**
   ```bash
   vercel
   ```
   - Set up and deploy: **`Y`**
   - Which scope: *(select your personal account or team)*
   - Link to existing project: **`N`**
   - Project name: `department-workflow-agent` *(or press Enter)*
   - In which directory: **`./`** *(press Enter)*

3. **Set Environment Variables on Vercel:**
   ```bash
   vercel env add MONGO_URI
   # Paste your MongoDB Atlas URI when prompted, select: Production, Preview, Development

   vercel env add JWT_SECRET
   # Enter your JWT secret, select: Production, Preview, Development
   ```

4. **Deploy to Production:**
   ```bash
   vercel --prod
   ```
   Vercel will output your live production URL (e.g. `https://department-workflow-agent.vercel.app`).

---

## 🧪 Post-Deployment Verification

Once deployed to your `.vercel.app` domain:

1. Open your live URL (e.g. `https://your-project.vercel.app/login`).
2. Use the **Quick Demo One-Click Access** buttons on the login screen to sign in as:
   - **Student:** `student@college.edu`
   - **Faculty:** `faculty@college.edu`
   - **HOD:** `hod@college.edu`
   - **Admin:** `admin@college.edu`
   *(All demo accounts use password `Student@123`, `Faculty@123`, `Hod@123`, and `Admin@123`)*
3. Check the health check endpoint at `https://your-project.vercel.app/api/health` to confirm the serverless function is online.

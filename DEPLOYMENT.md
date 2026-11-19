# Deployment Guide: Backend on Render & Frontend on Vercel

This repository is configured to deploy the **Node.js/Express backend on Render** and the **React/Vite frontend on Vercel**, connected to a cloud **MongoDB Atlas** database.

---

## Architecture Overview

- **Backend**: Hosted on [Render](https://render.com) as a Web Service (`backend/` directory).
- **Frontend**: Hosted on [Vercel](https://vercel.com) as a Vite SPA (`frontend/` directory).
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) (free M0 cluster).

---

## Step 1: Set Up MongoDB Atlas (Database)

If you don't already have a cloud MongoDB database:

1. Sign up or log in at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 cluster** (select your nearest cloud provider/region).
3. Under **Security > Database Access**:
   - Create a database user with username and password (e.g., `ems_user` and a strong password).
4. Under **Security > Network Access**:
   - Click **Add IP Address** and select **Allow Access from Anywhere** (`0.0.0.0/0`), so Render can connect.
5. Under **Deployment > Database**:
   - Click **Connect** > **Drivers** (Node.js).
   - Copy the connection string. It looks like:
     ```text
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/employee_management?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your database user credentials.

---

## Step 2: Deploy the Backend to Render

### Option A: Using Render Blueprint (Fastest)

1. Push your latest code changes to your GitHub repository (`main` branch):
   ```bash
   git add .
   git commit -m "Configure Render and Vercel deployment"
   git push origin main
   ```
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** > **Blueprint**.
4. Select your repository (`fswd-ex-6`).
5. Render detects `render.yaml`:
   - Enter your `MONGODB_URI` when prompted.
   - Enter your `CLIENT_URL` (you can enter your preliminary Vercel URL or `*` for now, and update it after deploying frontend).
   - `JWT_SECRET` will be automatically generated as a secure 32+ character key.
6. Click **Apply**.

---

### Option B: Manual Web Service Setup on Render

1. On the Render Dashboard, click **New +** > **Web Service**.
2. Connect your GitHub repository (`fswd-ex-6`).
3. Fill in the following settings:
   - **Name**: `ems-backend` (or any name you prefer)
   - **Region**: Choose the region closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend` *(Important!)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Expand **Environment Variables** and add:
   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Production environment mode |
   | `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
   | `JWT_SECRET` | *(At least 32 random characters)* | e.g., `8f8b72e1284d43e59178129bc6238b1f834a9b23c52a48c90de123456789abcd` |
   | `CLIENT_URL` | `https://your-app.vercel.app` | Your Vercel frontend URL (can update after frontend deployment) |
5. Click **Deploy Web Service**.
6. Wait for the build and deployment to complete. Render will display your live backend URL (e.g., `https://ems-backend-xxxx.onrender.com`).
7. Test the health endpoint by visiting:
   ```text
   https://ems-backend-xxxx.onrender.com/api/health
   ```
   You should see: `{"status":"ok"}`.

---

## Step 3: Seed Admin & Demo Accounts (Optional)

To initialize default admin and sample employee accounts on your MongoDB Atlas database:

From your local machine (in `backend/`):
```powershell
cd backend
# Set your MongoDB Atlas URI temporarily
$env:MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/employee_management?retryWrites=true&w=majority"
$env:JWT_SECRET="8f8b72e1284d43e59178129bc6238b1f834a9b23c52a48c90de123456789abcd"

# Run seed script
npm run seed
```

Default credentials seeded:
- **Admin**: `admin@ems.local` / `Admin123!`
- **Employees**: `alex@ems.local` / `Employee123!`

---

## Step 4: Deploy the Frontend to Vercel

### Resolving the "Import multi-service project" Screen

If Vercel shows the prompt *"Import multi-service project: This repository needs a vercel.json to configure its services"*:

1. In the Vercel Import screen:
   - In the **Configure Project** section, look for **Root Directory**.
   - Click **Edit** next to **Root Directory**.
   - Select the `frontend` folder and click **Continue**.
2. Framework Preset will auto-detect as **Vite**.
3. Expand **Environment Variables** and add:
   - **NAME**: `VITE_API_URL`
   - **VALUE**: `https://<your-render-backend-name>.onrender.com/api`
   *(Be sure to include `/api` at the end and use your actual Render service URL)*
4. Click **Deploy**.

> **Note**: Even if you leave Root Directory as `./`, the root `vercel.json` and `package.json` are preconfigured to build `frontend` automatically. Setting Root Directory to `frontend` in Vercel is the cleanest approach.

---

## Step 5: Connect Vercel & Render (CORS)

Once Vercel finishes deploying, you will receive your live frontend URL (e.g., `https://fswd-ex-6.vercel.app`):

1. Go back to your [Render Dashboard](https://dashboard.render.com).
2. Select your `ems-backend` Web Service.
3. Go to **Environment**.
4. Set or update `CLIENT_URL` to your Vercel URL:
   ```text
   https://fswd-ex-6.vercel.app
   ```
5. Click **Save Changes**. Render will automatically restart the backend with the new allowed origin.

> **Note**: The backend CORS configuration also automatically allows all `https://*.vercel.app` domains, ensuring preview deployments work seamlessly.

---

## Step 6: Verify Everything Works

1. Visit your live Vercel URL.
2. Sign in with the demo admin account (`admin@ems.local` / `Admin123!`).
3. You should see the admin dashboard load employee profiles fetched directly from your Render backend API.
# 📚 University PYQ Portal — Central University of Jammu

A production-grade, resume-worthy previous year question paper platform built using the **MERN Stack** (React, Express, Node.js, MongoDB). Features secure JWT authentication, direct browser-embedded PDF views, Cloudinary file stores, integrated AI-OCR (PDF parsing & Image text extractions), and a gorgeous glassmorphic light/dark dashboard UI optimized for Vercel and Render.

---

## 🌟 Key Product Features

### 1. Unified Academic Catalog
- **Multi-Level Browsing:** Navigate papers seamlessly by School Department &rarr; Degree Major Branch &rarr; Academic Semester (1st to 8th) &rarr; Subject Course.
- **Cascading Filters:** Fast, reactive sorting by Exam Year, Question Type (Very Short, Short, Long), and Marks (2, 5, 10, 20).

### 2. Side-by-Side Split View PYQ Viewer
- **Native Embedded Reader:** Read the original exam PDF directly in-browser on the left pane with fit-to-width scaling.
- **Copyable Question Tabs:** Read, search, and copy specific pre-parsed questions on the right pane without downloading the full document.
- **Action Toolbar:** One-click options to Download PDF, toggle custom Bookmarks workspace, or flag/report broken files.

### 3. AI-OCR & Heuristic Parsing Pipeline
- **Dual Text Extraction:** Direct digital text parsing via `pdf-parse` (super-fast) and Optical Character Recognition via `tesseract.js` for scanned documents or phone photos.
- **Automated Heuristic Segmenter:** Runs regex classifiers on OCR outputs to split papers into individual Question records, categorizing them by marks and type automatically!

### 4. Admin Management Center
- **Statistical Analytics:** Total counts (Users, Papers, Questions, Reports) and branch-wise distributions mapped to charts.
- **Report Moderation Queue:** Actively approve or dismiss students' file flag reports in real-time.
- **User Role Management:** Promote standard user registrations to Administrators or revoke access credentials.

---

## 📂 Project Architecture

```text
cuj_pyq_portal/
├── backend/
│   ├── src/
│   │   ├── config/            # DB (Mongoose) and Cloudinary configs
│   │   ├── controllers/       # MVC Controller layer (Auth, Academic, Papers, Admin)
│   │   ├── middleware/        # Authentication checks, CORS, limits, error handlers
│   │   ├── models/            # Mongoose Schema Definitions (User, Branch, Subject, Paper, Question)
│   │   ├── routes/            # REST API Routes (/api/v1)
│   │   ├── services/          # OCR engines (pdf-parse, tesseract), Cloudinary streams
│   │   └── utils/             # Database seed script (seed.js)
│   ├── .env.example           # Configurations template
│   └── package.json           # Backend dependencies listing
├── frontend/
│   ├── src/
│   │   ├── components/        # Common UI layouts (Nav, Footer, Skeletons, Guards)
│   │   ├── context/           # Global Contexts (Auth session, Theme toggles)
│   │   ├── pages/             # Dynamic views (Home, Viewer, Upload, Admin Panels)
│   │   └── services/          # Axios instance with auto-JWT interceptors
│   ├── vercel.json            # Vercel deep SPA routing fallback
│   └── package.json           # Frontend packages listing
└── package.json               # Root monorepo workspace scripts
```

---

## 🛠️ Local Development Quickstart

### Prerequisite Environment
- **Node.js** (v18.0.0 or higher recommended)
- **MongoDB** (Local instance or MongoDB Atlas cluster connection URI)

### Step 1: Install Dependencies
From the workspace root, run the unified installer to fetch both frontend and backend packages:
```bash
npm run install:all
```

### Step 2: Configure Environment Keys
1. Navigate to the `backend/` directory.
2. Create a `.env` file from the provided `.env.example`:
```bash
cp .env.example .env
```
3. Open `.env` and fill in your connection credentials:
```ini
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_custom_jwt_signature_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Step 3: Seed sandbox Database
Execute the pre-loaded seed script to clear the collections and populate the initial structure along with pre-saved mock accounts and sample papers:
```bash
npm run seed
```
* **Administrator sandbox Login:** `admin@cuj.edu` (password: `admin123`)
* **Standard student sandbox Login:** `student@cuj.edu` (password: `student123`)

### Step 4: Run Development Servers
Open two terminal windows to execute both processes concurrently, or run them separately:
- **Run Backend API server (Port 5000):**
  ```bash
  npm run dev:backend
  ```
- **Run Frontend Vite server (Port 5173):**
  ```bash
  npm run dev:frontend
  ```

---

## 🚀 Cloud Deployment Roadmap

### 1. Frontend optimized for Vercel
1. Install Vercel CLI or link your repository to **Vercel Dashboard**.
2. Select `frontend/` as the root directory.
3. Configure settings:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add the Environment Variable:
   - `VITE_API_URL` pointing to your hosted Express backend (e.g. `https://cuj-pyq-backend.onrender.com/api/v1`).
5. Vercel automatically reads `frontend/vercel.json` and configures fallback routes.

### 2. Backend optimized for Render
1. Create a new **Web Service** on Render.
2. Set the Root Directory to `backend`.
3. Configure settings:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Set Advanced Environment Variables in Render Dashboard:
   - `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `FRONTEND_URL` pointing to your deployed Vercel domain (e.g. `https://cuj-pyq-portal.vercel.app`) to authorize CORS access.

---

## 📈 Future Scalability Suggestions
1. **Redis Caching:** Cache departments and subjects collections on Redis to decrease database response times down to 2ms.
2. **Text Summarization:** Hook the extracted OCR text into a lightweight LLM API (like Gemini Nano or Gemini 1.5 Flash) to generate model solutions and cheat sheets automatically for every uploaded paper.
3. **Download Compression:** Bundle multiple question papers of a subject into a single zipped format before downloading.

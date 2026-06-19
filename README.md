# 📚 CUJ PYQ Portal

A comprehensive, production-grade academic resource platform built to digitize and organize previous year question papers for university students. 

This project tackles the difficult problem of unstructured, scattered academic resources by providing a centralized, highly searchable catalog powered by an automated AI-OCR engine that extracts text directly from scanned documents.

https://project-wx9j1.vercel.app/

---

## 🌟 Features

*   **Unified Academic Catalog**: Seamlessly browse by Department, Degree Branch, Semester, and Subject.
*   **Dual-Pane Reader**: View the original PDF alongside extracted text for side-by-side studying.
*   **AI-OCR Question Parsing**: Automatically processes uploaded PDFs (both digital and scanned images) using Ghostscript and Tesseract.js to extract text.
*   **Role-Based Access Control**: Strict JWT-based authentication ensuring only verified administrators can upload and modify materials.
*   **Granular Filters**: Instantly sort and search extracted questions by Exam Year, Question Type, and Marks.
*   **Robust Worker Architecture**: CPU-intensive OCR tasks are offloaded to Node.js background workers to maintain a highly responsive API.

---

## 💻 Tech Stack

*   **Frontend**: React, Vite, TailwindCSS, React Router, Context API
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB (Mongoose)
*   **File Storage**: Cloudinary
*   **OCR Engine**: `pdf-parse` (digital text) + `pdf2pic` / `tesseract.js` (scanned image fallback)
*   **Authentication**: JWT via HTTP-Only Cookies

---

## ⚠️ Known Limitations

*   **OCR Accuracy Dependency**: Text extraction relies on Tesseract.js. The accuracy of the parsed text heavily depends on the scan quality, contrast, and handwriting legibility of the uploaded document. Heavily distorted or extremely low-resolution scans may result in partial text extraction.
*   **Sample Dataset**: This deployment serves as a functional proof-of-concept. The current database is seeded with a curated subset of departments, subjects, and semesters to demonstrate the system's capabilities, rather than an exhaustive catalog of all university courses.

---

## 🛠️ Local Development

### 1. Configure Environment Variables
Navigate to the `backend/` directory, create a `.env` file, and provide your credentials:
```ini
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_custom_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 2. Install Dependencies & Seed Database
```bash
# Install all workspace dependencies
npm run install:all

# Navigate to backend and seed the initial academic catalog
cd backend
npm run seed
```

### 3. Run Servers
```bash
# Run backend (Port 5000)
npm run dev:backend

# Run frontend (Port 5173)
npm run dev:frontend
```

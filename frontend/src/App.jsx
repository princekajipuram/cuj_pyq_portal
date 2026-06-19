import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Providers
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

// Route Guard
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

// Layouts
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';

// Public Pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Departments from './pages/Departments.jsx';
import Subjects from './pages/Subjects.jsx';
import SubjectDetails from './pages/SubjectDetails.jsx';
import PyqViewer from './pages/PyqViewer.jsx';
import NotFound from './pages/NotFound.jsx';

// Protected Pages
import SavedPapers from './pages/SavedPapers.jsx';
import UploadPaper from './pages/UploadPaper.jsx';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard.jsx';
import ManagePapers from './pages/ManagePapers.jsx';
import ManageUsers from './pages/ManageUsers.jsx';
import ReportsPage from './pages/ReportsPage.jsx';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* ADMIN CONTROL ROUTES (Wrapped in Protected Guard & Dashboard Layout) */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute adminOnly={true}>
                  <DashboardLayout>
                    <Routes>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="/papers" element={<ManagePapers />} />
                      <Route path="/users" element={<ManageUsers />} />
                      <Route path="/reports" element={<ReportsPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* PUBLIC & STANDARD STUDENT ROUTES (Wrapped in Public Navbar/Footer) */}
            <Route
              path="/*"
              element={
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-grow">
                    <Routes>
                      {/* Public Paths */}
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/departments" element={<Departments />} />
                      <Route path="/subjects/:branchId" element={<Subjects />} />
                      <Route path="/subject-details/:subjectId" element={<SubjectDetails />} />
                      <Route path="/viewer/:paperId" element={<PyqViewer />} />

                      {/* Student Protected Paths */}
                      <Route
                        path="/saved"
                        element={
                          <ProtectedRoute>
                            <SavedPapers />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/upload"
                        element={
                          <ProtectedRoute adminOnly={true}>
                            <UploadPaper />
                          </ProtectedRoute>
                        }
                      />

                      {/* Fallback 404 */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

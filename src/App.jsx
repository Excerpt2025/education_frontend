import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext.jsx';
import { AdminAuthProvider } from './context/AdminAuthContext.jsx';

import Navbar from './components/Navbar/Navbar.jsx';
import Footer from './components/Footer/Footer.jsx';
import WhatsAppButton from './components/WhatsAppButton/WhatsAppButton.jsx';
import BackToTop from './components/BackToTop/BackToTop.jsx';
import PageEnter from './motion/PageEnter.jsx';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';
import AdminProtectedRoute from './components/AdminProtectedRoute/AdminProtectedRoute.jsx';

// Public pages
import Home from './pages/Home/Home.jsx';
import About from './pages/About/About.jsx';
import Services from './pages/Services/Services.jsx';
import Blog from './pages/Blog/Blog.jsx';
import BlogPost from './pages/Blog/BlogPost.jsx';
import Contact from './pages/Contact/Contact.jsx';
import Login from './pages/Login/Login.jsx';
import Register from './pages/Register/Register.jsx';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword.jsx';
import CareerAssessment from './pages/CareerAssessment/CareerAssessment.jsx';
import Subscription from './pages/Subscription/Subscription.jsx';
import KcetPredictor from './pages/KcetPredictor/KcetPredictor.jsx';
import PgcetPredictor from './pages/PgcetPredictor/PgcetPredictor.jsx';
import StudentDashboard from './pages/StudentDashboard/StudentDashboard.jsx';
import Colleges from './pages/Colleges/Colleges.jsx';
import CollegeDetail from './pages/CollegeDetail/CollegeDetail.jsx';
import CollegeAdmissionEnquiry from './pages/CollegeAdmissionEnquiry/CollegeAdmissionEnquiry.jsx';
import NotFound from './pages/NotFound/NotFound.jsx';

// Admin pages
import AdminLogin from './admin/AdminLogin/AdminLogin.jsx';
import AdminLayout from './admin/AdminLayout/AdminLayout.jsx';
import AdminDashboard from './admin/AdminDashboard/AdminDashboard.jsx';
import ManageStudents from './admin/ManageStudents/ManageStudents.jsx';
import ManageSubscriptions from './admin/ManageSubscriptions/ManageSubscriptions.jsx';
import ManageAssessments from './admin/ManageAssessments/ManageAssessments.jsx';
import ManageCareerRoadmap from './admin/ManageCareerRoadmap/ManageCareerRoadmap.jsx';
import ManagePayments from './admin/ManagePayments/ManagePayments.jsx';
import ManageReferrals from './admin/ManageReferrals/ManageReferrals.jsx';
import ManageCollegeReferrals from './admin/ManageCollegeReferrals/ManageCollegeReferrals.jsx';
import ManageCollegeInterest from './admin/ManageCollegeInterest/ManageCollegeInterest.jsx';
import ManageKcetData from './admin/ManageKcetData/ManageKcetData.jsx';
import ManagePgcetData from './admin/ManagePgcetData/ManagePgcetData.jsx';
import ManageColleges from './admin/ManageColleges/ManageColleges.jsx';
import ManageCourses from './admin/ManageCourses/ManageCourses.jsx';
import ManageSlider from './admin/ManageSlider/ManageSlider.jsx';
import ManagePages from './admin/ManagePages/ManagePages.jsx';
import Reports from './admin/Reports/Reports.jsx';
import AdminSettings from './admin/AdminSettings/AdminSettings.jsx';
import ManagePredictorLeads from './admin/ManagePredictorLeads/ManagePredictorLeads.jsx';

// Layout wrapper for all public-facing pages (Navbar + Footer)
function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="mmc-public-main">
        <PageEnter>{children}</PageEnter>
      </main>
      <Footer />
      <WhatsAppButton />
      <BackToTop />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminAuthProvider>
          <Routes>
            {/* ---------------- Public site ---------------- */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
            <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
            <Route path="/blog/:slug" element={<PublicLayout><BlogPost /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
            <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
            <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
            <Route path="/career-assessment" element={<PublicLayout><CareerAssessment /></PublicLayout>} />
            <Route path="/subscription" element={<PublicLayout><Subscription /></PublicLayout>} />
            <Route path="/kcet-predictor" element={<PublicLayout><KcetPredictor /></PublicLayout>} />
            <Route path="/pgcet-predictor" element={<PublicLayout><PgcetPredictor /></PublicLayout>} />
            <Route path="/college-compare" element={<PublicLayout><Colleges /></PublicLayout>} />
            <Route path="/colleges" element={<PublicLayout><Colleges /></PublicLayout>} />
            <Route path="/colleges/:id" element={<PublicLayout><CollegeDetail /></PublicLayout>} />
            <Route path="/college-admission-enquiry" element={<PublicLayout><CollegeAdmissionEnquiry /></PublicLayout>} />
            <Route
              path="/dashboard"
              element={<PublicLayout><ProtectedRoute><StudentDashboard /></ProtectedRoute></PublicLayout>}
            />

            {/* ---------------- Admin panel ---------------- */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<ManageStudents />} />
              <Route path="subscriptions" element={<ManageSubscriptions />} />
              <Route path="assessments" element={<ManageAssessments />} />
              <Route path="career-roadmap" element={<ManageCareerRoadmap />} />
              <Route path="payments" element={<ManagePayments />} />
              <Route path="referrals" element={<ManageReferrals />} />
              <Route path="college-referrals" element={<ManageCollegeReferrals />} />
              <Route path="college-interest" element={<ManageCollegeInterest />} />
              <Route path="kcet-data" element={<ManageKcetData />} />
              <Route path="pgcet-data" element={<ManagePgcetData />} />
              <Route path="predictor-leads" element={<ManagePredictorLeads />} />
              <Route path="colleges" element={<ManageColleges />} />
              <Route path="courses" element={<ManageCourses />} />
              <Route path="sliders" element={<ManageSlider />} />
              <Route path="pages" element={<ManagePages />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* ---------------- 404 ---------------- */}
            <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
          </Routes>
        </AdminAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import ProtectedRoute from "./ProtectedRoute";
import PageTransition from "../components/animation/PageTransition";

// Auth Pages
import Login from "../pages/auth/Login";
import ActivateAccount from "../pages/auth/ActivateAccount";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// Dashboards
import AdminDashboard from "../pages/admin/AdminDashboard";
import EmployeeDashboard from "../pages/employee/EmployeeDashboard";
import EmployeeLeaves from "../pages/employee/Leaves";
import EmployeeSalary from "../pages/employee/Salary";
import EmployeeBankDetails from "../pages/employee/BankDetails";
import EmployeeProjects from "../pages/employee/Projects";
import EmployeeProjectDetails from "../pages/employee/ProjectDetails";
import EmployeeProfile from "../pages/employee/Profile";
import HRDashboard from "../pages/hr/HRDashboard";

//Attendance
import HRAttendance from "../pages/hr/Attendence";
import EmployeeAttendance from "../pages/employee/Attendance";

//Employees Profile
import HREmployeeProfile from "../pages/hr/EmployeesProfile";
import AdminEmployeeProfile from "../pages/admin/EmployeeProfile";
// Pages

//HR Pages
import HREmployees from "../pages/hr/Employees";
import AdminEmployees from "../pages/admin/Employees";
import HomePage from "../pages/HomePage/HomePage";
import AboutUs from "../pages/AboutUs/AboutUs";
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy/PrivacyPolicy"));
const TermsOfService = lazy(() => import("../pages/TermsOfService/TermsOfService"));
import Overview from "../pages/Overview/Overview";
import Features from "../pages/FeaturesPage/Features";
import Integrations from "../pages/Integrations/Integrations";
import ApiPage from "../pages/Api/ApiPage";
import HRPayroll from "../pages/hr/Payroll"
import HRLeaves from "../pages/hr/Leaves"
import HRBankdetails from "../pages/hr/BankDetails"
import HRProfile from "../pages/hr/Profile"
import CreateProject from "../pages/hr/CreateProject"
import ProjectDetails from "../pages/hr/ProjectDetails";
import HRprojects from "../pages/hr/Projects"
import PayrollPay from "../pages/hr/PayrollPay";
import CreateEmployee from "../pages/hr/CreateEmployee";
import AdminProjects from "../pages/admin/Projects";
import AdminProjectDetails from "../pages/admin/ProjectDetails";
import AdminCreateProject from "../pages/admin/CreateProject";
import AdminAttendance from "../pages/admin/AttendanceReports";
import AdminAuditLogs from "../pages/admin/AuditLogs";
import AdminHRManagement from "../pages/admin/HRManagement";
import AdminProfile from "../pages/admin/Profile";
import AdminPayroll from "../pages/admin/Payroll";
import AdminReports from "../pages/admin/Reports";
import AdminDemoRequests from "../pages/admin/DemoRequests";
import NotFound from "../pages/NotFound";
import Cookies from "../pages/Cookies/Cookies";
import GetStarted from "../components/ui/GetStarted";
import PreviewGallery from "../pages/Preview/PreviewGallery";

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/overview" element={<Overview />} />
                <Route path="/features" element={<Features />} />
                <Route path="/integrations" element={<Integrations />} />
                <Route path="/api" element={<ApiPage />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/cookies" element={<Cookies />} />
                <Route path="/get-started" element={<GetStarted />} />
                <Route path="/preview" element={<PreviewGallery />} />
                <Route
                    path="/privacy"
                    element={
                        <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
                            <PrivacyPolicy />
                        </Suspense>
                    }
                />
                <Route
                    path="/terms"
                    element={
                        <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
                            <TermsOfService />
                        </Suspense>
                    }
                />

                {/* Auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/activate" element={<ActivateAccount />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                    path="/reset-password/:token"
                    element={<ResetPassword />}
                />

                

                {/* Admin */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <PageTransition>
                                <AdminDashboard />
                            </PageTransition>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/employees"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <AdminEmployees />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/employees/:id"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <AdminEmployeeProfile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/employees/create"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <CreateEmployee />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/projects"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <AdminProjects />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/projects/create"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <AdminCreateProject />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/projects/:id"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <AdminProjectDetails />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/attendance"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <AdminAttendance />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/audit-logs"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <AdminAuditLogs />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/hr"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <AdminHRManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/profile"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <AdminProfile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/payroll"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <AdminPayroll />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/reports"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <AdminReports />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/demo-requests"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <AdminDemoRequests />
                        </ProtectedRoute>
                    }
                />

                {/* HR */}
                <Route
                    path="/hr"
                    element={
                        <ProtectedRoute allowedRoles={["HR"]}>
                            <PageTransition>
                                <HRDashboard />
                            </PageTransition>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/hr/employees"
                    element={
                        <ProtectedRoute allowedRoles={["HR"]}>
                            <HREmployees />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/hr/employees/create"
                    element={
                        <ProtectedRoute allowedRoles={["HR"]}>
                            <CreateEmployee />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/hr/employees/:id"
                    element={
                        <ProtectedRoute allowedRoles={["HR"]}>
                            <HREmployeeProfile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/hr/attendance"
                    element={
                        <ProtectedRoute allowedRoles={["HR"]}>
                            <HRAttendance />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/hr/payroll"
                    element={
                        <ProtectedRoute allowedRoles={["HR"]}>
                            <HRPayroll />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/hr/leaves"
                    element={
                        <ProtectedRoute allowedRoles={["HR"]}>
                            <HRLeaves />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/hr/bank-details"
                    element={
                        <ProtectedRoute allowedRoles={["HR"]}>
                            <HRBankdetails />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/hr/projects"
                    element={
                        <ProtectedRoute allowedRoles={["HR", "Admin"]}>
                            <HRprojects />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/hr/projects/:id"
                    element={
                        <ProtectedRoute allowedRoles={["HR", "Admin", "TeamLeader"]}>
                            <ProjectDetails />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/hr/projects/create"
                    element={
                        <ProtectedRoute allowedRoles={["HR", "Admin"]}>
                            <CreateProject />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/hr/profile"
                    element={
                        <ProtectedRoute allowedRoles={["HR"]}>
                            <HRProfile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/hr/employee/:id/pay"
                    element={
                        <ProtectedRoute allowedRoles={["HR", "Admin"]}>
                            <PayrollPay />
                        </ProtectedRoute>
                    }
                />

                {/* Employee */}
                <Route
                    path="/employee"
                    element={
                        <ProtectedRoute
                            allowedRoles={["Employee", "HR", "Admin"]}
                        >
                            <PageTransition>
                                <EmployeeDashboard />
                            </PageTransition>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/teamleader"
                    element={
                        <ProtectedRoute
                            allowedRoles={["TeamLeader", "Employee", "HR", "Admin"]}
                        >
                            <Navigate to="/employee" replace />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employee/attendance"
                    element={
                        <ProtectedRoute
                            allowedRoles={["Employee", "HR", "TeamLeader"]}
                        >
                            <EmployeeAttendance />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/employee/salary"
                    element={
                        <ProtectedRoute
                            allowedRoles={["Employee", "HR", "TeamLeader"]}
                        >
                            <EmployeeSalary />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/employee/leaves"
                    element={
                        <ProtectedRoute
                            allowedRoles={["Employee", "HR", "TeamLeader"]}
                        >
                            <EmployeeLeaves />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/employee/bank-details"
                    element={
                        <ProtectedRoute
                            allowedRoles={["Employee", "HR", "TeamLeader"]}
                        >
                            <EmployeeBankDetails />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/employee/projects"
                    element={
                        <ProtectedRoute
                            allowedRoles={["Employee", "HR", "TeamLeader"]}
                        >
                            <EmployeeProjects />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/employee/projects/:id"
                    element={
                        <ProtectedRoute
                            allowedRoles={["Employee", "HR", "TeamLeader"]}
                        >
                            <ProjectDetails />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/employee/profile"
                    element={
                        <ProtectedRoute
                            allowedRoles={["Employee", "HR", "TeamLeader"]}
                        >
                            <EmployeeProfile />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;

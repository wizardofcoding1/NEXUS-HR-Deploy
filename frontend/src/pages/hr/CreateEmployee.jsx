import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import Button from "../../components/ui/Button";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import { createEmployee } from "../../services/employeeService";
import { toastError, toastSuccess } from "../../utils/toast";
import { useAuthStore } from "../../store/authStore";
import useForm from "../../hooks/useForm";
import useAsync from "../../hooks/useAsync";

const CreateEmployee = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [created, setCreated] = useState(null);
    const today = new Date().toISOString().split("T")[0];
    const basePath = user?.role === "Admin" ? "/admin" : "/hr";

    const { values: formData, handleChange } = useForm({
        name: "",
        personalEmail: "",
        phone: "",
        department: "",
        position: "",
        shift: "Morning",
        dateOfJoining: "",
        employmentStatus: "Active",
        aadharNumber: "",
        panNumber: "",
        isActive: true,
        autoGeneratePassword: true,
        salaryBasic: "",
        salaryHra: "",
        salaryAllowances: "",
        salaryOvertimeRate: "",
        salaryPaidLeaveDeduction: "",
        salaryHalfDayDeduction: "",
        salaryPf: "",
        salaryTax: "",
    });
    const submitter = useAsync(async (payload) => {
        const res = await createEmployee(payload);
        return res;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                personalEmail: formData.personalEmail,
                phone: formData.phone,
                department: formData.department,
                position: formData.position,
                shift: formData.shift,
                dateOfJoining: formData.dateOfJoining,
                employmentStatus: formData.employmentStatus,
                aadharNumber: formData.aadharNumber,
                panNumber: formData.panNumber,
                isActive: formData.isActive,
                role: "Employee",
                autoGeneratePassword: formData.autoGeneratePassword,
                salary: {
                    basic: Number(formData.salaryBasic || 0),
                    hra: Number(formData.salaryHra || 0),
                    allowances: Number(formData.salaryAllowances || 0),
                    overtimeRate: Number(formData.salaryOvertimeRate || 0),
                    paidLeaveDeduction: Number(formData.salaryPaidLeaveDeduction || 0),
                    halfDayDeduction: Number(formData.salaryHalfDayDeduction || 0),
                    deductions: {
                        pf: Number(formData.salaryPf || 0),
                        tax: Number(formData.salaryTax || 0),
                    },
                },
            };
            const res = await submitter.run(payload);
            setCreated(res);
            toastSuccess("Employee created successfully");
            if (res?.emailError) {
                toastError(`Email not sent: ${res.emailError}`);
            }
            // Redirect after brief delay or stay to show success
            setTimeout(() => {
                 if (res?._id) navigate(`${basePath}/employees/${res._id}`);
                 else navigate(`${basePath}/employees`);
            }, 2000);
           
        } catch (error) {
            toastError(error?.response?.data?.message || "Failed to create employee");
        }
    };

    return (
        <MainLayout>
            {submitter.loading && <LoadingOverlay label="Creating Employee Profile..." />}
            
            <div className="max-w-4xl mx-auto pb-10">
                {/* Header */}
                <div className="flex items-center gap-2 mb-6 text-sm text-slate-500">
                    <button onClick={() => navigate(`${basePath}/employees`)} className="hover:text-blue-600 transition-colors flex items-center gap-1">
                        <span>&larr;</span> Employees
                    </button>
                    <span>/</span>
                    <span className="text-slate-800 font-medium">Onboard New</span>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h1 className="text-xl font-bold text-slate-800">Employee Onboarding</h1>
                        <p className="text-sm text-slate-500 mt-1">Enter personal, employment, and payroll details.</p>
                    </div>

                    <div className="p-6">
                        {created && (
                            <div className="bg-green-50 border border-green-200 text-green-900 rounded-lg p-4 mb-6 shadow-sm">
                                <p className="font-bold flex items-center gap-2 mb-1">
                                    <span className="w-5 h-5 bg-green-200 text-green-700 rounded-full flex items-center justify-center text-xs">✓</span>
                                    Success! Redirecting...
                                </p>
                                <p className="text-sm ml-7">Employee ID: <span className="font-mono font-medium">{created.employeeId}</span></p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            
                            {/* Section 1: Personal Info */}
                            <section>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                                        <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none border" placeholder="John Doe" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Personal Email <span className="text-red-500">*</span></label>
                                        <input type="email" name="personalEmail" required value={formData.personalEmail} onChange={handleChange} className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none border" placeholder="john@gmail.com" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone <span className="text-red-500">*</span></label>
                                        <input type="text" name="phone" required value={formData.phone} onChange={handleChange} className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none border" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Aadhar No.</label>
                                            <input type="text" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">PAN No.</label>
                                            <input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange} className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none border" />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2: Employment Details */}
                            <section>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Employment Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Department <span className="text-red-500">*</span></label>
                                        <input type="text" name="department" required value={formData.department} onChange={handleChange} className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none border" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Position <span className="text-red-500">*</span></label>
                                        <input type="text" name="position" required value={formData.position} onChange={handleChange} className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none border" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Shift <span className="text-red-500">*</span></label>
                                        <select name="shift" required value={formData.shift} onChange={handleChange} className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none border bg-white">
                                            <option value="Morning">Morning</option>
                                            <option value="Evening">Evening</option>
                                            <option value="Night">Night</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Date of Joining <span className="text-red-500">*</span></label>
                                        <input type="date" name="dateOfJoining" required value={formData.dateOfJoining} onChange={handleChange} min={today} className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none border text-slate-600" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Employment Status</label>
                                        <select name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none border bg-white">
                                            <option value="Active">Active</option>
                                            <option value="On Leave">On Leave</option>
                                            <option value="Probation">Probation</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-6">
                                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                        <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="rounded text-blue-600 focus:ring-blue-500" />
                                        Account Active
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                        <input type="checkbox" name="autoGeneratePassword" checked={formData.autoGeneratePassword} onChange={handleChange} className="rounded text-blue-600 focus:ring-blue-500" />
                                        Auto-generate & Email Password
                                    </label>
                                </div>
                            </section>

                            {/* Section 3: Payroll Config */}
                            <section>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Payroll Configuration</h3>
                                <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-5">
                                    
                                    {/* Earnings */}
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 mb-3 uppercase">Earnings</p>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs text-slate-600 mb-1">Basic Salary</label>
                                                <input type="number" name="salaryBasic" value={formData.salaryBasic} onChange={handleChange} className="w-full border-slate-300 rounded px-2 py-1.5 text-sm border outline-none focus:border-blue-500" placeholder="0.00" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-600 mb-1">HRA</label>
                                                <input type="number" name="salaryHra" value={formData.salaryHra} onChange={handleChange} className="w-full border-slate-300 rounded px-2 py-1.5 text-sm border outline-none focus:border-blue-500" placeholder="0.00" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-600 mb-1">Allowances</label>
                                                <input type="number" name="salaryAllowances" value={formData.salaryAllowances} onChange={handleChange} className="w-full border-slate-300 rounded px-2 py-1.5 text-sm border outline-none focus:border-blue-500" placeholder="0.00" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rates */}
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 mb-3 uppercase">Rates & Deductions</p>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs text-slate-600 mb-1">Overtime (Rate/Hr)</label>
                                                <input type="number" name="salaryOvertimeRate" value={formData.salaryOvertimeRate} onChange={handleChange} className="w-full border-slate-300 rounded px-2 py-1.5 text-sm border outline-none focus:border-blue-500" placeholder="0.00" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-600 mb-1">Paid Leave Deduction (Per Day)</label>
                                                <input type="number" name="salaryPaidLeaveDeduction" value={formData.salaryPaidLeaveDeduction} onChange={handleChange} className="w-full border-slate-300 rounded px-2 py-1.5 text-sm border outline-none focus:border-blue-500" placeholder="0.00" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-600 mb-1">Half Day Deduction</label>
                                                <input type="number" name="salaryHalfDayDeduction" value={formData.salaryHalfDayDeduction} onChange={handleChange} className="w-full border-slate-300 rounded px-2 py-1.5 text-sm border outline-none focus:border-blue-500" placeholder="0.00" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Statutory */}
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 mb-3 uppercase">Statutory</p>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs text-slate-600 mb-1">PF Deduction</label>
                                                <input type="number" name="salaryPf" value={formData.salaryPf} onChange={handleChange} className="w-full border-slate-300 rounded px-2 py-1.5 text-sm border outline-none focus:border-blue-500" placeholder="0.00" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-600 mb-1">Professional Tax</label>
                                                <input type="number" name="salaryTax" value={formData.salaryTax} onChange={handleChange} className="w-full border-slate-300 rounded px-2 py-1.5 text-sm border outline-none focus:border-blue-500" placeholder="0.00" />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </section>

                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => navigate(`${basePath}/employees`)}
                                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    isLoading={submitter.loading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                                >
                                    Create Employee
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default CreateEmployee;

import MainLayout from "../../layouts/MainLayout";
import BankDetailsPersonal from "../Components/BankDetails/BankDetailsPersonal";

const EmployeeBankDetails = () => {
    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto space-y-6 pb-10">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Financial Information</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your bank account details for payroll processing.</p>
                </div>
                
                <BankDetailsPersonal title="My Bank Account" canEdit />
            </div>
        </MainLayout>
    );
};

export default EmployeeBankDetails;
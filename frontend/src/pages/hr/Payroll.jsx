import MainLayout from "../../layouts/MainLayout";
import PayrollDashboard from "../../components/payroll/PayrollDashboard";

const Payroll = () => {
    return (
        <MainLayout>
            <PayrollDashboard variant="hr" />
        </MainLayout>
    );
};

export default Payroll;

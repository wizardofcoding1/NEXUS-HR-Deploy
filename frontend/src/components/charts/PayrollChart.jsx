import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const PayrollChart = ({ data }) => {
    const normalizedData = Array.isArray(data)
        ? data.map((item) => ({
              ...item,
              month: item.month || item.name,
          }))
        : [];

    return (
        <div className="bg-white rounded-xl shadow p-5 h-72">
            <h3 className="font-semibold mb-3">
                Payroll Overview
            </h3>

            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={normalizedData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#22c55e" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PayrollChart;

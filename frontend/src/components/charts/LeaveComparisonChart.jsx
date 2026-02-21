import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

const LeaveComparisonChart = ({ data, title }) => {
    if (!data?.length) {
        return (
            <div className="bg-white rounded-xl shadow p-5 h-72">
                <h3 className="font-semibold mb-3">{title}</h3>
                <p className="text-slate-500">No data available</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow p-5 h-80">
            <h3 className="font-semibold mb-3">{title}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Approved" stackId="a" fill="#16a34a" />
                    <Bar dataKey="Pending" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="Rejected" stackId="a" fill="#ef4444" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LeaveComparisonChart;

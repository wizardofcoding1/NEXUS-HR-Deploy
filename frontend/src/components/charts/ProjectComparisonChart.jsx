import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

const colors = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#7c3aed"];

const ProjectComparisonChart = ({ series }) => {
    if (!series?.length) {
        return (
            <div className="bg-white rounded-xl shadow p-5 h-72">
                <h3 className="font-semibold mb-3">Projects Created</h3>
                <p className="text-slate-500">No data available</p>
            </div>
        );
    }

    const maxDays = Math.max(
        ...series.map((s) => s.days?.length || 0),
    );
    const data = [];
    for (let i = 1; i <= maxDays; i += 1) {
        const row = { day: i };
        series.forEach((s) => {
            const match = s.days?.find((d) => d.day === i);
            row[s.month] = match?.count || 0;
        });
        data.push(row);
    }

    return (
        <div className="bg-white rounded-xl shadow p-5 h-80">
            <h3 className="font-semibold mb-3">Projects Created (Daily)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <XAxis dataKey="day" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    {series.map((s, idx) => (
                        <Line
                            key={s.month}
                            type="monotone"
                            dataKey={s.month}
                            stroke={colors[idx % colors.length]}
                            strokeWidth={2}
                            dot={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ProjectComparisonChart;

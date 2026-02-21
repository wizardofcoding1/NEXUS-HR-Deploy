import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const AttendanceChart = ({ data }) => {
    const normalizedData = Array.isArray(data)
        ? data.map((item) => ({
              ...item,
              day: item.day || item.name,
          }))
        : [];

    return (
        <div className="bg-white rounded-xl shadow p-5 h-72">
            <h3 className="font-semibold mb-3">
                Attendance Trend
            </h3>

            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={normalizedData}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="present"
                        stroke="#2563eb"
                        strokeWidth={2}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AttendanceChart;

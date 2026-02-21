import { useMemo } from "react";

const toKey = (date) => {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

const getStatusConfig = (status) => {
    switch (status) {
        case "Checked In": return { class: "bg-indigo-100 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" };
        case "Full-Day": return { class: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" };
        case "Half-Day": return { class: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" };
        case "Absent": return { class: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" };
        case "Present": return { class: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" };
        default: return { class: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-300" };
    }
};

const getDisplayStatus = (record) => {
    if (!record) return null;
    if (record.checkIn && !record.checkOut) return "Checked In";
    if (record.status) return record.status;
    if (record.checkIn && record.checkOut) return "Present";
    return "Absent";
};

const AttendanceCalendar = ({
    monthDate,
    records = [],
    selectedDate,
    onSelectDate,
}) => {
    const current = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const startDay = current.getDay();
    const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();

    const today = new Date();
    const todayKey = toKey(today);

    const recordMap = useMemo(() => {
        const map = new Map();
        records.forEach((rec) => {
            if (rec.date) map.set(toKey(rec.date), rec);
        });
        return map;
    }, [records]);

    const cells = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(current.getFullYear(), current.getMonth(), day));

    return (
        <div className="w-full select-none">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-t-lg overflow-hidden border border-slate-200">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="bg-slate-50 py-2 text-center text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {d.slice(0, 3)} {/* First 3 chars */}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-slate-200 border-x border-b border-slate-200 rounded-b-lg overflow-hidden">
                {cells.map((date, idx) => {
                    if (!date) return <div key={`empty-${idx}`} className="bg-white min-h-[80px] md:min-h-[120px]" />;

                    const key = toKey(date);
                    const record = recordMap.get(key);
                    const isToday = key === todayKey;
                    const isSelected = selectedDate && toKey(selectedDate) === key;
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    
                    const displayStatus = getDisplayStatus(record);
                    const statusConfig = displayStatus ? getStatusConfig(displayStatus) : null;

                    return (
                        <button
                            type="button"
                            key={key}
                            onClick={() => onSelectDate?.(date)}
                            className={`relative bg-white p-1 md:p-2 text-left min-h-[80px] md:min-h-[120px] transition-all hover:bg-slate-50 outline-none focus:z-10 group
                                ${isSelected ? "ring-2 ring-inset ring-indigo-600 z-10" : ""}
                                ${isToday ? "bg-indigo-50/40" : ""}
                            `}
                        >
                            {/* Date Number */}
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-xs md:text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full 
                                    ${isToday ? "bg-indigo-600 text-white" : isWeekend ? "text-slate-400" : "text-slate-700"}`}>
                                    {date.getDate()}
                                </span>
                                
                                {/* Mobile: Status Dot */}
                                {statusConfig && (
                                    <span className={`block md:hidden w-2 h-2 rounded-full ${statusConfig.dot}`} />
                                )}
                            </div>

                            {/* Desktop: Status Badge */}
                            {displayStatus && (
                                <div className={`hidden md:block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1 border w-fit ${statusConfig.class}`}>
                                    {displayStatus}
                                </div>
                            )}

                            {/* Desktop: Timings */}
                            <div className="hidden md:block space-y-0.5">
                                {record?.checkIn && (
                                    <div className="flex items-center gap-1 text-[10px] text-slate-600">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                )}
                                {record?.checkOut && (
                                    <div className="flex items-center gap-1 text-[10px] text-slate-600">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                        {new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                )}
                            </div>

                            {/* Mobile: Small indicators if present */}
                            <div className="block md:hidden mt-2 flex flex-col gap-0.5">
                                {record?.checkIn && <div className="h-1 w-full bg-green-400 rounded-full opacity-50"></div>}
                                {record?.checkOut && <div className="h-1 w-3/4 bg-red-400 rounded-full opacity-50"></div>}
                            </div>

                            {/* Corner Indicators (Late/OT) */}
                            <div className="absolute bottom-1 right-1 flex gap-0.5">
                                {record?.lateIn && <div className="w-1.5 h-1.5 rounded-full bg-orange-400" title="Late In" />}
                                {record?.overtimeMinutes > 0 && <div className="w-1.5 h-1.5 rounded-full bg-purple-500" title="Overtime" />}
                            </div>
                        </button>
                    );
                })}
            </div>
            
            {/* Legend for Mobile Clarity */}
            <div className="md:hidden mt-3 flex items-center justify-center gap-4 text-[10px] text-slate-500">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Checked In</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Present</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Half-Day</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Absent</div>
            </div>
        </div>
    );
};

export default AttendanceCalendar;

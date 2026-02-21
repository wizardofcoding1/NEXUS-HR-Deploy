const TableSkeleton = ({ rows = 5 }) => (
    <div className="animate-pulse space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
            <div
                key={i}
                className="h-6 bg-slate-200 rounded"
            />
        ))}
    </div>
);

export default TableSkeleton;
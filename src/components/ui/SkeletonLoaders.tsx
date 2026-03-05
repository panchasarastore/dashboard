import { Skeleton } from "@/components/ui/skeleton";

export const StatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="dashboard-card h-32 animate-pulse">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-8 w-32" />
            </div>
        ))}
    </div>
);

export const OrdersSkeleton = () => (
    <div className="dashboard-card">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
        </div>
    </div>
);

export const ChartSkeleton = () => (
    <div className="dashboard-card h-[400px] flex flex-col">
        <Skeleton className="h-6 w-48 mb-6" />
        <Skeleton className="flex-1 w-full rounded-xl" />
    </div>
);

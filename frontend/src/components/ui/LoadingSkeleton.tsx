import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <div className="h-16 border-b" />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Skeleton className="lg:col-span-2 h-[300px] rounded-xl" />
                    <Skeleton className="h-[300px] rounded-xl" />
                </div>
            </div>
        </div>
    );
};

export const CardGridSkeleton = () => (
    <div className="min-h-screen flex flex-col">
        <div className="h-16 border-b" />
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 space-y-2">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex gap-4 mb-8">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
            </div>
        </div>
    </div>
);

export const ListSkeleton = () => (
    <div className="min-h-screen flex flex-col">
        <div className="h-16 border-b" />
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 space-y-2">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-4 w-48" />
            </div>
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
            </div>
        </div>
    </div>
);

export const ProfileSkeleton = () => (
    <div className="min-h-screen flex flex-col">
        <div className="h-16 border-b" />
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <Skeleton className="h-10 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Skeleton className="h-96 rounded-xl" />
                    <Skeleton className="h-48 rounded-xl" />
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-48 rounded-xl" />
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            </div>
        </div>
    </div>
);

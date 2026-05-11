import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function InspectionDetailSkeleton() {
    return (
        <section className="mx-auto w-full max-w-5xl px-4 py-4 md:px-6">
            <div className="space-y-4">
                <Card>
                    <CardHeader className="space-y-3">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>

                    <CardContent className="grid gap-3 md:grid-cols-2">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton key={index} className="h-20 rounded-xl" />
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="space-y-3 p-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Skeleton key={index} className="h-20 rounded-xl" />
                        ))}
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}
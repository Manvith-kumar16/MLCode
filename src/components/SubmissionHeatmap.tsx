import { useMemo, useState } from "react";
import { format, subDays, eachDayOfInterval, startOfWeek, getDay, isSameDay, startOfMonth, isSameMonth, addDays } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface SubmissionHeatmapProps {
    data?: { date: string; count: number }[];
}

const SubmissionHeatmap = ({ data = [] }: SubmissionHeatmapProps) => {
    const today = new Date();
    // Ensure we start from 365 days ago
    const startDate = subDays(today, 365);

    // Filter year selection state (not fully functional yet, just UI)
    const [yearView, setYearView] = useState("Current");

    // 1. Process Data & Calculate Stats
    const { submissionMap, totalSubmissions, activeDays, maxStreak } = useMemo(() => {
        const map = new Map<string, number>();
        let total = 0;
        let active = 0;
        let currentStreak = 0;
        let maxStr = 0;

        // Sort data by date just in case
        const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        sortedData.forEach(item => {
            const count = item.count;
            if (count > 0) {
                map.set(item.date, count);
                total += count;
                active++;
            }
        });

        // Calculate streak (consecutive days with > 0 submissions)
        // We need to check every day in the interval
        const allDays = eachDayOfInterval({ start: startDate, end: today });
        allDays.forEach(day => {
            const dateStr = format(day, "yyyy-MM-dd");
            if (map.has(dateStr)) {
                currentStreak++;
            } else {
                maxStr = Math.max(maxStr, currentStreak);
                currentStreak = 0;
            }
        });
        maxStr = Math.max(maxStr, currentStreak);

        return { submissionMap: map, totalSubmissions: total, activeDays: active, maxStreak: maxStr };
    }, [data, startDate, today]);


    // 2. Generate Grid Data (Weeks)
    const weeks = useMemo(() => {
        const days = eachDayOfInterval({ start: startDate, end: today });
        const weeksArray: Date[][] = [];
        let currentWeek: Date[] = [];

        days.forEach((day) => {
            if (getDay(day) === 0 && currentWeek.length > 0) {
                weeksArray.push(currentWeek);
                currentWeek = [];
            }
            currentWeek.push(day);
        });
        if (currentWeek.length > 0) weeksArray.push(currentWeek);
        return weeksArray;
    }, [startDate, today]);

    // 3. Generate Month Labels
    const months = useMemo(() => {
        const monthLabels: { label: string; index: number }[] = [];
        let lastMonth = -1;

        weeks.forEach((week, index) => {
            // Use the first day of the week to determine the month
            // or better, verify if the first day of month is in this week
            const firstDayOfWeek = week[0];
            const month = firstDayOfWeek.getMonth();

            if (month !== lastMonth) {
                monthLabels.push({ label: format(firstDayOfWeek, "MMM"), index });
                lastMonth = month;
            }
        });
        return monthLabels;
    }, [weeks]);


    const getColor = (count: number) => {
        if (count === 0) return "bg-[#161b22]"; // GitHub dark empty color
        if (count <= 2) return "bg-[#0e4429]"; // Low activity
        if (count <= 5) return "bg-[#006d32]"; // Medium
        if (count <= 10) return "bg-[#26a641]"; // High
        return "bg-[#39d353]"; // Very High
    };

    return (
        <div className="w-full text-foreground">
            {/* Header Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-normal">
                        <span className="font-semibold text-foreground">{totalSubmissions}</span> submissions in the past one year
                    </h3>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Total submissions from {format(startDate, "MMM d, yyyy")} - {format(today, "MMM d, yyyy")}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div>
                        Total active days: <span className="text-foreground font-medium">{activeDays}</span>
                    </div>
                    <div>
                        Max streak: <span className="text-foreground font-medium">{maxStreak}</span>
                    </div>
                    {/* Year Dropdown Placeholder */}
                    <div className="bg-[#21262d] px-3 py-1 rounded-md text-foreground text-xs font-medium cursor-pointer border border-border/20">
                        {yearView} ▾
                    </div>
                </div>
            </div>

            {/* Heatmap Grid */}
            <div className="border border-border/20 rounded-md p-4 bg-[#0d1117] overflow-x-auto scrollbar-hide">
                <div className="min-w-[800px]">
                    {/* Month Labels */}
                    <div className="flex mb-2 text-xs text-muted-foreground ml-8 relative h-4">
                        {months.map((m, i) => (
                            <div
                                key={m.label + i}
                                style={{
                                    position: 'absolute',
                                    left: `${m.index * 15}px` // Approx width of column + gap
                                }}
                            >
                                {m.label}
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-1">
                        {/* Day Labels (Mon, Wed, Fri) */}
                        <div className="flex flex-col gap-1 text-[10px] text-muted-foreground pt-3 pr-2 leading-none">
                            <span className="h-[10px]"></span>
                            <span className="h-[10px]">Mon</span>
                            <span className="h-[10px]"></span>
                            <span className="h-[10px]">Wed</span>
                            <span className="h-[10px]"></span>
                            <span className="h-[10px]">Fri</span>
                            <span className="h-[10px]"></span>
                        </div>

                        {/* Grid */}
                        <div className="flex gap-[3px]">
                            {weeks.map((week, weekIndex) => (
                                <div key={weekIndex} className="flex flex-col gap-[3px]">
                                    {week.map((day, dayIndex) => {
                                        const dateStr = format(day, "yyyy-MM-dd");
                                        const count = submissionMap.get(dateStr) || 0;
                                        return (
                                            <TooltipProvider key={dayIndex}>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger>
                                                        <div
                                                            className={`h-[10px] w-[10px] rounded-[2px] ${getColor(count)} border border-white/5`}
                                                            data-date={dateStr}
                                                        />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="bg-popover text-popover-foreground text-xs p-2 border border-border">
                                                        <div className="font-medium">
                                                            {count === 0 ? "No submissions" : `${count} submissions`}
                                                        </div>
                                                        <div className="text-muted-foreground">
                                                            {format(day, "EEEE, MMMM do, yyyy")}
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4 justify-end">
                    <span>Less</span>
                    <div className="flex gap-[3px]">
                        <div className="h-[10px] w-[10px] rounded-[2px] bg-[#161b22] border border-white/5"></div>
                        <div className="h-[10px] w-[10px] rounded-[2px] bg-[#0e4429] border border-white/5"></div>
                        <div className="h-[10px] w-[10px] rounded-[2px] bg-[#006d32] border border-white/5"></div>
                        <div className="h-[10px] w-[10px] rounded-[2px] bg-[#26a641] border border-white/5"></div>
                        <div className="h-[10px] w-[10px] rounded-[2px] bg-[#39d353] border border-white/5"></div>
                    </div>
                    <span>More</span>
                </div>
            </div>
        </div>
    );
};

export default SubmissionHeatmap;

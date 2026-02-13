import { CheckCircle2, XCircle, Clock, AlertTriangle, FileCode } from "lucide-react";
import { format } from "date-fns";

interface Submission {
    _id: string;
    problemTitle: string;
    status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Compilation Error';
    language: string;
    createdAt: string;
}

interface RecentSubmissionsProps {
    submissions: Submission[];
}

const RecentSubmissions = ({ submissions = [] }: RecentSubmissionsProps) => {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Accepted': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'Wrong Answer': return <XCircle className="h-4 w-4 text-red-500" />;
            case 'Time Limit Exceeded': return <Clock className="h-4 w-4 text-yellow-500" />;
            default: return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Accepted': return "text-green-500";
            case 'Wrong Answer': return "text-red-500";
            case 'Time Limit Exceeded': return "text-yellow-500";
            default: return "text-muted-foreground";
        }
    };

    if (submissions.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No recent submissions</div>;
    }

    return (
        <div className="space-y-3">
            {submissions.map((sub) => (
                <div key={sub._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-border/50 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3">
                        {getStatusIcon(sub.status)}
                        <div>
                            <div className="font-medium text-sm">{sub.problemTitle}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <span>{format(new Date(sub.createdAt), 'MMM d, yyyy')}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><FileCode className="h-3 w-3" /> {sub.language}</span>
                            </div>
                        </div>
                    </div>
                    <div className={`text-sm font-medium ${getStatusColor(sub.status)}`}>
                        {sub.status}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RecentSubmissions;

import React, { useEffect, useState } from 'react';
import { Target } from 'lucide-react';
import { api } from '../services/localApi';

interface Props {
    questionUuid: string;
    questionId: string | number;
}

const QuestionInsight: React.FC<Props> = ({ questionUuid, questionId }) => {
    const [percent, setPercent] = useState<number | null>(null);

    useEffect(() => {
        const id = questionUuid || String(questionId);
        if (!id) return;
        api.getQuestionStats(id).then(res => {
            if (res.data && res.data.totalAttempts > 0) {
                setPercent(res.data.accuracyPercent);
            }
        });
    }, [questionUuid, questionId]);

    if (percent === null) return null;

    return (
        <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-primary/50">
            <Target className="w-3 h-3" />
            <span>{percent}% ইউজার সঠিক উত্তর দিয়েছে</span>
        </div>
    );
};

export default QuestionInsight;

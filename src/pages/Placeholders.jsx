import React from 'react';

const Placeholder = ({ title }) => (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-xl bg-surface/50">
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-text-muted">This module is under development.</p>
    </div>
);

export const Practice = () => <Placeholder title="Practice Mode" />;
export const QuestionBank = () => <Placeholder title="Question Bank (Admin)" />;
export const Analytics = () => <Placeholder title="Performance Analytics" />;
export const Settings = () => <Placeholder title="Settings" />;

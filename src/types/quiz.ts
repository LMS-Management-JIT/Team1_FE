export interface QuizQuestionPublic {
    id: string;
    questionText: string;
    options: string[];
    questionOrder: number;
    correctOptionIndex?: number; 
}

export interface QuizAnswerItem {
    questionId: string;
    selectedOptionIndex: number;
}

export interface QuizAnswerResult {
    questionId: string;
    selectedOptionIndex: number;
    correctOptionIndex: number;
    correct: boolean;
}

export interface QuizSubmissionResult {
    correctCount: number;
    totalCount: number;
    scorePercent: number;
    results: QuizAnswerResult[];
}

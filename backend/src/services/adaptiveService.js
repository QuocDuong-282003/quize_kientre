const Question = require('../models/Question');

class AdaptiveService {
    calculateNextDifficulty(currentDifficulty, isCorrect) {
        let next = isCorrect ? currentDifficulty + 1 : currentDifficulty - 1;
        return Math.max(1, Math.min(5, next));
    }

    checkEarlyExit(history) {
        if (!history || history.length < 6) return false;

        const answered = history.length;
        const correct = history.filter(h => h.isCorrect).length;
        const accuracy = correct / answered;

        const recent = history.slice(-3).map(h => h.difficulty);
        const stableRecent = recent.length === 3 && (Math.max(...recent) - Math.min(...recent) <= 1);

        if (answered >= 8 && (accuracy >= 0.85 || accuracy <= 0.25)) return true;

        if (answered >= 6 && stableRecent && (accuracy >= 0.8 || accuracy <= 0.3)) return true;

        return false;
    }

    calculateResult(history) {
        const totalDifficulty = history.reduce((sum, item) => sum + item.difficulty, 0);
        if (totalDifficulty === 0) {
            return { score: 0, level: "Beginner" };
        }

        const earnedDifficulty = history.reduce((sum, item) => sum + (item.isCorrect ? item.difficulty : 0), 0);
        const score = Math.max(0, Math.min(100, Math.round((earnedDifficulty / totalDifficulty) * 100)));

        let level = "Beginner";
        if (score >= 80) level = "Advanced";
        else if (score >= 55) level = "Intermediate";

        return { score, level };
    }


    async getNextQuestion(difficulty, answeredIds, userId = null, examId = null) {
        const { Types: { ObjectId } } = require('mongoose');
        const answeredObjectIds = answeredIds.map(id => new ObjectId(id));

        let matchCondition = {
            difficulty: difficulty,
            _id: { $nin: answeredObjectIds }
        };

        if (examId) {
            matchCondition.examId = new ObjectId(examId);
        }

        if (userId) {
            const QuizSession = require('../models/QuizSession');
            const userSessions = await QuizSession.find({ userId });
            const correctQuestionIds = [];

            userSessions.forEach(session => {
                session.history.forEach(item => {
                    if (item.isCorrect) {
                        correctQuestionIds.push(new ObjectId(item.questionId));
                    }
                });
            });

            matchCondition._id.$nin = [...answeredObjectIds, ...correctQuestionIds];
        }

        let results = await Question.aggregate([
            { $match: matchCondition },
            { $sample: { size: 1 } }
        ]);

        if (results.length === 0) {
            let fallbackCondition = { _id: { $nin: answeredObjectIds } };
            if (examId) {
                fallbackCondition.examId = new ObjectId(examId);
            }
            if (userId) {
                const QuizSession = require('../models/QuizSession');
                const userSessions = await QuizSession.find({ userId });
                const correctQuestionIds = [];
                userSessions.forEach(session => {
                    session.history.forEach(item => {
                        if (item.isCorrect) {
                            correctQuestionIds.push(new ObjectId(item.questionId));
                        }
                    });
                });
                fallbackCondition._id.$nin = [...answeredObjectIds, ...correctQuestionIds];
            }

            results = await Question.aggregate([
                { $match: fallbackCondition },
                { $sample: { size: 1 } }
            ]);
        }

        return results[0];
    }
}

module.exports = new AdaptiveService();
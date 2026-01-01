const Question = require('../models/Question');

class AdaptiveService {
    calculateNextDifficulty(currentDifficulty, isCorrect) {
        let next = isCorrect ? currentDifficulty + 1 : currentDifficulty - 1;
        return Math.max(1, Math.min(5, next));
    }

    checkEarlyExit(history) {
        if (!history || history.length < 5) return false;

        const recent = history.slice(-5);
        const allCorrect = recent.every(h => h.isCorrect);
        const allWrong = recent.every(h => !h.isCorrect);

        if (allCorrect || allWrong) return true;

        if (history.length >= 7) {
            const correctCount = history.filter(h => h.isCorrect).length;
            const ratio = correctCount / history.length;
            if (ratio >= 0.9 || ratio <= 0.2) return true;
        }

        return false;
    }

    calculateResult(history) {
        if (!history || history.length === 0) {
            return { score: 0, level: "Beginner" };
        }

        const totalDifficulty = history.reduce((sum, item) => sum + item.difficulty, 0);
        const earnedDifficulty = history.reduce((sum, item) => sum + (item.isCorrect ? item.difficulty : 0), 0);

        const score = totalDifficulty > 0
            ? Math.round((earnedDifficulty / totalDifficulty) * 100)
            : 0;

        const finalScore = Math.max(0, Math.min(100, score));

        let level = "Beginner";
        if (finalScore >= 80) level = "Advanced";
        else if (finalScore >= 55) level = "Intermediate";

        return { score: finalScore, level };
    }


    async getNextQuestion(difficulty, answeredIds, userId = null) {
        const { Types: { ObjectId } } = require('mongoose');
        const answeredObjectIds = answeredIds.map(id => new ObjectId(id));

        let matchCondition = {
            difficulty: difficulty,
            _id: { $nin: answeredObjectIds }
        };

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

            matchCondition._id = {
                $nin: [...answeredObjectIds, ...correctQuestionIds]
            };
        }

        let results = await Question.aggregate([
            { $match: matchCondition },
            { $sample: { size: 1 } }
        ]);

        if (results.length === 0) {
            let fallbackCondition = { _id: { $nin: answeredObjectIds } };
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
                fallbackCondition._id = {
                    $nin: [...answeredObjectIds, ...correctQuestionIds]
                };
            }

            results = await Question.aggregate([
                { $match: fallbackCondition },
                { $sample: { size: 1 } }
            ]);
        }

        if (!results || results.length === 0) {
            const anyQuestion = await Question.findOne();
            if (!anyQuestion) {
                throw new Error('Không có câu hỏi nào trong database');
            }
            return anyQuestion;
        }

        return results[0];
    }
}

module.exports = new AdaptiveService();
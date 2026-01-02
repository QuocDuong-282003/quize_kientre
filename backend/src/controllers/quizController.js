const QuizSession = require('../models/QuizSession');
const Question = require('../models/Question');
const adaptiveService = require('../services/adaptiveService');

// Get questions by examId
exports.getQuestionsByExam = async (req, res) => {
    try {
        const { examId } = req.params;
        const { Types: { ObjectId } } = require('mongoose');

        const questions = await Question.find({ examId: new ObjectId(examId) })
            .select('-__v')
            .sort({ difficulty: 1 });

        if (!questions || questions.length === 0) {
            return res.status(404).json({ error: 'No questions found for this exam' });
        }

        res.json(questions);
    } catch (err) {
        console.error('Get Questions Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// exports.startQuiz = async (req, res) => {
//     try {
//         const firstQuestion = await Question.findOne({ difficulty: 3 });
//         const session = new QuizSession({
//             currentDifficulty: 3,
//             nextQuestionId: firstQuestion._id
//         });
//         await session.save();
//         res.status(201).json({ sessionId: session._id, question: firstQuestion });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };
const SESSION_TTL_MS = 1000 * 60 * 90; // 90 minutes per session window

exports.startQuiz = async (req, res) => {
    try {
        const { userId, examId } = req.body;
        const { Types: { ObjectId } } = require('mongoose');

        const examMatch = examId ? { examId: new ObjectId(examId) } : {};

        // Nếu user không login, random câu hỏi bình thường
        let firstQ;
        if (!userId) {
            firstQ = await Question.findOne({ difficulty: 3, ...examMatch });
        } else {
            // Nếu user đã login, lấy danh sách câu hỏi đã làm
            const userSessions = await QuizSession.find(examId ? { userId, examId } : { userId });
            const answeredQuestionIds = [];
            const wrongQuestionIds = [];

            // Tìm các câu đã làm đúng và sai
            userSessions.forEach(session => {
                session.history.forEach(item => {
                    if (item.isCorrect) {
                        answeredQuestionIds.push(item.questionId.toString());
                    } else {
                        wrongQuestionIds.push(item.questionId.toString());
                    }
                });
            });

            // Random câu chưa làm hoặc làm sai (exclude câu làm đúng)
            firstQ = await Question.aggregate([
                {
                    $match: {
                        difficulty: 3,
                        ...examMatch,
                        _id: {
                            $nin: answeredQuestionIds.map(id => new ObjectId(id)),
                            $in: [
                                ...wrongQuestionIds.map(id => new ObjectId(id))
                            ]
                        }
                    }
                },
                { $sample: { size: 1 } }
            ]);

            // Nếu tất cả câu level 3 đều làm rồi, random từ câu chưa làm
            if (!firstQ || firstQ.length === 0) {
                firstQ = await Question.aggregate([
                    {
                        $match: {
                            difficulty: 3,
                            ...examMatch,
                            _id: { $nin: answeredQuestionIds.map(id => new ObjectId(id)) }
                        }
                    },
                    { $sample: { size: 1 } }
                ]);
            }

            firstQ = firstQ.length > 0 ? firstQ[0] : await Question.findOne({ difficulty: 3, ...examMatch });
        }

        if (!firstQ) {
            return res.status(404).json({ error: 'No questions available for this exam' });
        }

        const session = new QuizSession({
            userId: userId || null,
            examId: examId || null,
            currentQuestionId: firstQ._id,
            lastActivity: new Date(),
            expiresAt: new Date(Date.now() + SESSION_TTL_MS)
        });
        await session.save();
        res.json({ sessionId: session._id, question: firstQ, examId: examId || null });
    } catch (err) {
        console.error('Start Quiz Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};
// exports.submitAnswer = async (req, res) => {
//     try {
//         const { sessionId, questionId, selectedAnswerIds } = req.body;
//         const session = await QuizSession.findById(sessionId);

//         if (!session || session.isFinished) return res.status(400).json({ message: "Quiz session invalid or ended" });

//         // ANTI-CHEAT: Kiểm tra xem user có đang submit đúng câu hỏi hiện tại không
//         if (session.nextQuestionId.toString() !== questionId) {
//             return res.status(400).json({ message: "Invalid question submission (Anti-cheat)" });
//         }

//         const question = await Question.findById(questionId);
//         const isCorrect = JSON.stringify(selectedAnswerIds.sort()) === JSON.stringify(question.correctAnswerIds.sort());

//         session.history.push({ questionId: question._id, isCorrect, difficulty: question.difficulty });

//         // Kiểm tra điều kiện kết thúc (10 câu HOẶC kết thúc sớm)
//         const isEarlyExit = adaptiveService.checkEarlyExit(session.history);
//         if (session.history.length >= 10 || isEarlyExit) {
//             const { score, level } = adaptiveService.calculateResult(session.history);
//             session.isFinished = true;
//             session.finalScore = score;
//             session.estimatedLevel = level;
//             await session.save();
//             return res.json({ isFinished: true, score, level, reason: isEarlyExit ? "Early termination" : "Completed" });
//         }

//         // Tìm câu hỏi tiếp theo
//         const nextDiff = adaptiveService.calculateNextDifficulty(question.difficulty, isCorrect);
//         const nextQuestion = await adaptiveService.getNextQuestion(nextDiff, session.history.map(h => h.questionId));

//         session.currentDifficulty = nextDiff;
//         session.nextQuestionId = nextQuestion._id; // Cập nhật câu hỏi được phép submit tiếp theo
//         await session.save();

//         res.json({ isFinished: false, nextQuestion, progress: session.history.length });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

exports.submitAnswer = async (req, res) => {
    try {
        const { sessionId, questionId, selectedAnswerIds = [], reason, finishEarly } = req.body;
        console.log('Submit Answer - sessionId:', sessionId, 'questionId:', questionId, 'reason:', reason);

        const session = await QuizSession.findById(sessionId);

        if (!session) {
            return res.status(400).json({ error: 'Session not found' });
        }

        const now = new Date();
        if (session.expiresAt && session.expiresAt < now) {
            return res.status(400).json({
                error: 'Session expired',
                message: 'Phiên làm bài đã hết hạn, vui lòng bắt đầu lại.'
            });
        }

        if (session.isFinished) {
            return res.status(400).json({
                error: 'Quiz already finished',
                message: 'Phát hiện gian lận: Bài thi đã kết thúc!'
            });
        }

        // Cho phép nộp bài ngay mà không cần trả lời câu hiện tại
        if (finishEarly && selectedAnswerIds.length === 0) {
            const result = adaptiveService.calculateResult(session.history);
            session.isFinished = true;
            session.finalScore = result.score;
            session.estimatedLevel = result.level;
            session.lastActivity = now;
            session.expiresAt = new Date(Date.now() + SESSION_TTL_MS);
            await session.save();

            const fullSession = await QuizSession.findById(session._id).populate('history.questionId');

            return res.json({
                isFinished: true,
                score: result.score,
                level: result.level,
                reviewData: fullSession.history,
                sessionId: session._id,
                reason: 'finish_early'
            });
        }

        const question = await Question.findById(questionId);

        if (!question) {
            return res.status(400).json({ error: 'Question not found' });
        }

        if (session.currentQuestionId.toString() !== questionId) {
            console.warn(' Anti-cheat: Invalid question submission');
            console.warn('Expected:', session.currentQuestionId.toString());
            console.warn('Received:', questionId);
            return res.status(400).json({
                error: 'Invalid question',
                message: 'Phát hiện gian lận: Câu hỏi không hợp lệ!'
            });
        }

        const alreadyAnswered = session.history.some(h => h.questionId.toString() === questionId);
        // Nếu đã trả lời, cho phép làm lại: xóa bản ghi cũ rồi ghi lại
        if (alreadyAnswered) {
            session.history = session.history.filter(h => h.questionId.toString() !== questionId);
        }

        if (reason === 'tab_switch') {
            console.warn(' User switched tab - sessionId:', sessionId);
            session.hasTabSwitch = true;
        }

        const isCorrect = JSON.stringify(selectedAnswerIds.sort()) === JSON.stringify(question.correctAnswerIds.sort());

        const forceFinish = reason === 'tab_switch' || reason === 'mouse_leave_violation';

        session.history.push({
            questionId: question._id,
            selectedAnswerIds: selectedAnswerIds,
            isCorrect: isCorrect,
            difficulty: question.difficulty
        });

        // Kiểm tra điều kiện kết thúc
        const isEarlyExit = adaptiveService.checkEarlyExit(session.history);
        const shouldFinish = forceFinish || finishEarly || session.history.length >= 10 || isEarlyExit;
        if (shouldFinish) {
            const result = adaptiveService.calculateResult(session.history);

            session.isFinished = true;
            session.finalScore = result.score;
            session.estimatedLevel = result.level;
            session.lastActivity = now;
            session.expiresAt = new Date(Date.now() + SESSION_TTL_MS);
            await session.save();

            const fullSession = await QuizSession.findById(session._id).populate('history.questionId');

            console.log('Quiz finished - fullSession history:', JSON.stringify(fullSession.history, null, 2));

            return res.json({
                isFinished: true,
                score: result.score,
                level: result.level,
                reviewData: fullSession.history,
                sessionId: session._id,
                reason: forceFinish ? reason : (finishEarly ? 'finish_early' : (isEarlyExit ? 'early_exit' : 'completed'))
            });
        }

        // Nếu chưa kết thúc, tìm câu hỏi tiếp theo
        const nextDiff = adaptiveService.calculateNextDifficulty(question.difficulty, isCorrect);
        const nextQ = await adaptiveService.getNextQuestion(nextDiff, session.history.map(h => h.questionId), session.userId, session.examId);

        if (!nextQ) {
            // Không còn câu phù hợp: chấm điểm luôn
            const result = adaptiveService.calculateResult(session.history);
            session.isFinished = true;
            session.finalScore = result.score;
            session.estimatedLevel = result.level;
            session.lastActivity = now;
            session.expiresAt = new Date(Date.now() + SESSION_TTL_MS);
            await session.save();

            return res.json({
                isFinished: true,
                score: result.score,
                level: result.level,
                reviewData: session.history,
                sessionId: session._id,
                reason: 'no_more_questions'
            });
        }

        session.currentQuestionId = nextQ._id;
        session.lastActivity = now;
        session.expiresAt = new Date(Date.now() + SESSION_TTL_MS);
        await session.save();

        res.json({ isFinished: false, nextQuestion: nextQ, progress: session.history.length });
    } catch (err) {
        console.error('Submit Answer Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.getReview = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await QuizSession.findById(sessionId).populate('history.questionId');

        if (!session || !session.isFinished) {
            return res.status(404).json({ message: "Không tìm thấy kết quả bài thi" });
        }

        res.json({
            score: session.finalScore,
            level: session.estimatedLevel,
            history: session.history
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Quay lại câu trước (undo last answer)
exports.goBack = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await QuizSession.findById(sessionId);

        if (!session) return res.status(400).json({ error: 'Session not found' });
        if (session.isFinished) return res.status(400).json({ error: 'Quiz đã kết thúc' });
        if (!session.history || session.history.length === 0) {
            return res.status(400).json({ error: 'Không còn câu để quay lại' });
        }

        const now = new Date();
        if (session.expiresAt && session.expiresAt < now) {
            return res.status(400).json({ error: 'Session expired' });
        }

        const lastEntry = session.history.pop();
        const question = await Question.findById(lastEntry.questionId);

        if (!question) return res.status(400).json({ error: 'Question not found' });

        session.currentQuestionId = question._id;
        session.lastActivity = now;
        session.expiresAt = new Date(Date.now() + SESSION_TTL_MS);
        await session.save();

        return res.json({
            question,
            selectedAnswerIds: lastEntry.selectedAnswerIds || [],
            progress: session.history.length
        });
    } catch (err) {
        console.error('GoBack Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};
const QuizSession = require('../models/QuizSession');
const Question = require('../models/Question');
const adaptiveService = require('../services/adaptiveService');

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
exports.startQuiz = async (req, res) => {
    try {
        const { userId } = req.body;
        const mongoose = require('mongoose');
        const { Types: { ObjectId } } = mongoose;

        // Validation: Kiểm tra userId 
        if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid userId format' });
        }

        let firstQ;
        if (!userId) {
            firstQ = await Question.findOne({ difficulty: 3 });
        } else {
            const userSessions = await QuizSession.find({ userId });
            const answeredQuestionIds = [];
            const wrongQuestionIds = [];

            userSessions.forEach(session => {
                session.history.forEach(item => {
                    if (item.isCorrect) {
                        answeredQuestionIds.push(item.questionId.toString());
                    } else {
                        wrongQuestionIds.push(item.questionId.toString());
                    }
                });
            });


            const wrongQuestionObjectIds = wrongQuestionIds.map(id => new ObjectId(id));
            firstQ = await Question.aggregate([
                {
                    $match: {
                        difficulty: 3,
                        $or: [
                            { _id: { $nin: answeredQuestionIds.map(id => new ObjectId(id)) } },
                            { _id: { $in: wrongQuestionObjectIds } }
                        ]
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
                            _id: { $nin: answeredQuestionIds.map(id => new ObjectId(id)) }
                        }
                    },
                    { $sample: { size: 1 } }
                ]);
            }

            firstQ = firstQ.length > 0 ? firstQ[0] : await Question.findOne({ difficulty: 3 });
        }

        if (!firstQ) {
            return res.status(404).json({ error: 'Không tìm thấy câu hỏi trong database' });
        }

        const session = new QuizSession({
            userId: userId || null,
            currentQuestionId: firstQ._id
        });
        await session.save();
        res.json({ sessionId: session._id, question: firstQ });
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
        const { sessionId, questionId, selectedAnswerIds, reason } = req.body;

        // Validation: Kiểm tra required fields
        if (!sessionId || !questionId || !Array.isArray(selectedAnswerIds)) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'sessionId, questionId, và selectedAnswerIds là bắt buộc'
            });
        }

        // Validation: Kiểm tra format
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(sessionId) || !mongoose.Types.ObjectId.isValid(questionId)) {
            return res.status(400).json({
                error: 'Invalid ID format',
                message: 'sessionId và questionId phải là ObjectId hợp lệ'
            });
        }

        console.log('Submit Answer - sessionId:', sessionId, 'questionId:', questionId, 'reason:', reason);

        const session = await QuizSession.findById(sessionId);
        const question = await Question.findById(questionId);

        if (!session || !question) {
            return res.status(400).json({ error: 'Session or Question not found' });
        }

        if (session.isFinished) {
            return res.status(400).json({
                error: 'Quiz already finished',
                message: 'Phát hiện gian lận: Bài thi đã kết thúc!'
            });
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
        if (alreadyAnswered) {
            return res.status(400).json({
                error: 'Question already answered',
                message: 'Phát hiện gian lận: Câu hỏi đã được trả lời!'
            });
        }

        // ANTI-CHEAT #4: Log tab switch
        if (reason === 'tab_switch') {
            console.warn(' User switched tab - sessionId:', sessionId);
            session.hasTabSwitch = true;
        }

        // Kiểm tra điều kiện kết thúc - CHỈ kết thúc khi đủ 10 câu
        // Early exit chỉ áp dụng khi user chủ động nộp bài sớm (qua reason='early_submit')
        const isEarlySubmit = reason === 'early_submit';

        // Kiểm tra đúng/sai (luôn tính để dùng cho nextDiff nếu cần)
        const isCorrect = JSON.stringify(selectedAnswerIds.sort()) === JSON.stringify(question.correctAnswerIds.sort());

        // Sửa bug: Khi nộp bài sớm, chỉ thêm câu hiện tại vào history nếu đã chọn đáp án
        // Nếu chưa chọn đáp án (selectedAnswerIds rỗng), không thêm câu đó vào history
        if (isEarlySubmit && selectedAnswerIds.length === 0) {
            // Không thêm câu hiện tại vào history vì chưa được làm
            console.log('Early submit: Câu hiện tại chưa được làm, không thêm vào history');
        } else {
            // Thêm câu vào history
            session.history.push({
                questionId: question._id,
                selectedAnswerIds: selectedAnswerIds,
                isCorrect: isCorrect,
                difficulty: question.difficulty
            });
        }

        if (session.history.length >= 10 || isEarlySubmit) {
            const result = adaptiveService.calculateResult(session.history);

            session.isFinished = true;
            session.finalScore = result.score;
            session.estimatedLevel = result.level;
            await session.save();

            const fullSession = await QuizSession.findById(session._id).populate('history.questionId');

            console.log('Quiz finished - fullSession history:', JSON.stringify(fullSession.history, null, 2));

            console.log('Quiz finished - Score:', result.score, 'Level:', result.level, 'History length:', session.history.length);

            return res.json({
                isFinished: true,
                score: result.score || 0,
                level: result.level || 'Beginner',
                reviewData: fullSession.history,
                reason: isEarlySubmit ? 'early_submit' : 'completed'
            });
        }

        const nextDiff = adaptiveService.calculateNextDifficulty(question.difficulty, isCorrect);
        const nextQ = await adaptiveService.getNextQuestion(nextDiff, session.history.map(h => h.questionId), session.userId);

        if (!nextQ || !nextQ._id) {
            const result = adaptiveService.calculateResult(session.history);
            session.isFinished = true;
            session.finalScore = result.score;
            session.estimatedLevel = result.level;
            await session.save();

            const fullSession = await QuizSession.findById(session._id).populate('history.questionId');
            return res.json({
                isFinished: true,
                score: result.score,
                level: result.level,
                reviewData: fullSession.history,
                reason: 'Không còn câu hỏi phù hợp'
            });
        }

        session.currentQuestionId = nextQ._id;
        await session.save();

        res.json({ isFinished: false, nextQuestion: nextQ, progress: session.history.length });
    } catch (err) {
        console.error('Submit Answer Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// xem lại kết quả 
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
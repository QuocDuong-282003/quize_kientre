const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/adaptive_quiz';
        
        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(` MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(` Error: ${error.message}`);
        // Thoát chương trình với mã lỗi nếu không kết nối được DB
        process.exit(1);
    }
};

module.exports = connectDB;
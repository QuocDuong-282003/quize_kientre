const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        //const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/adaptive_quiz';
        const mongoURI = process.env.MONGODB_URI;

        // mongodb+srv://duong:<db_password>@cluster0.djyaprp.mongodb.net/?appName=Cluster0
        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(` MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(` Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
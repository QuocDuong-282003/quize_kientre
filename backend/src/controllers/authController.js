const User = require('../models/User');
const bcrypt = require('bcrypt');

// LOGIN 
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: "Email và mật khẩu là bắt buộc" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Email không tồn tại. Vui lòng đăng ký!" });
        }


        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Sai mật khẩu" });
        }

        res.json({ userId: user._id, email: user.email, success: true });
    } catch (err) {
        console.error('Login Error:', err.message);
        res.status(500).json({ message: err.message });
    }
};

// REGISTER -
exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: "Email và mật khẩu là bắt buộc" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
        }

        // Kiểm tra email đã tồn tại
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email đã được đăng ký" });
        }

        // Hash password với bcrypt (salt rounds = 10)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = new User({ email, password: hashedPassword });
        await user.save();

        res.json({
            success: true,
            message: "Đăng ký thành công! Vui lòng đăng nhập."
        });
    } catch (err) {
        console.error('Register Error:', err.message);
        res.status(500).json({ message: err.message });
    }
};
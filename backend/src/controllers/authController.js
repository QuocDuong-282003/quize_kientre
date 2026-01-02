const User = require('../models/User');

// LOGIN - Kiểm tra user đã tồn tại
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Email không tồn tại. Vui lòng đăng ký!" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Sai mật khẩu" });
        }

        res.json({ userId: user._id, email: user.email, success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// REGISTER - Tạo user mới
exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra email đã tồn tại
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email đã được đăng ký" });
        }

        // Tạo user mới
        const user = new User({ email, password });
        await user.save();

        // Đăng ký thành công nhưng không tự động login
        res.json({
            success: true,
            message: "Đăng ký thành công! Vui lòng đăng nhập."
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
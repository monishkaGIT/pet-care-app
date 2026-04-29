const User = require("../models/User");
const bcrypt = require("bcrypt");

const buildUserPayload = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    bio: user.bio,
    profileImage: user.profileImage,
});

// ── Public Auth ────────────────────────────────────────────────────

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, address, bio, profileImage, role } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Please provide a valid email address" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name, email, password: hashedPassword, phone, address, bio, profileImage, role: 'user'
        });

        res.status(201).json(buildUserPayload(user));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json(buildUserPayload(user));
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── Protected User Routes ──────────────────────────────────────────

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(buildUserPayload(user));
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
            user.address = req.body.address !== undefined ? req.body.address : user.address;
            user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
            user.profileImage = req.body.profileImage || user.profileImage;

            const updatedUser = await user.save();
            res.json(buildUserPayload(updatedUser));
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            return res.status(403).json({ message: "Admins cannot change their own password via this flow." });
        }

        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Old password and new password are required" });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters" });
        }

        const user = await User.findById(req.user._id);

        if (user && (await bcrypt.compare(oldPassword, user.password))) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();
            res.json({ message: "Password updated successfully" });
        } else {
            res.status(401).json({ message: "Invalid old password" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── Self Deletion ──────────────────────────────────────────────────

exports.deleteOwnAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        await User.deleteOne({ _id: user._id });
        res.json({ message: "Account successfully deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── Admin Controls ─────────────────────────────────────────────────

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role, phone, address, bio, profileImage } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name, email, password: hashedPassword, role: role || 'user', phone, address, bio, profileImage
        });
        res.status(201).json(buildUserPayload(user));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.name = req.body.name || user.name;
            user.role = req.body.role || user.role;
            user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
            user.address = req.body.address !== undefined ? req.body.address : user.address;
            user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
            user.profileImage = req.body.profileImage || user.profileImage;
            const updatedUser = await user.save();
            res.json(buildUserPayload(updatedUser));
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userToDelete = await User.findById(req.params.id);
        if (!userToDelete) return res.status(404).json({ message: "User not found" });

        if (userToDelete.role === 'admin' && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not allowed to delete an admin" });
        }

        await User.deleteOne({ _id: userToDelete._id });
        res.json({ message: "User removed" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

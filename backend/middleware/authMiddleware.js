const User = require("../models/User");

const protect = async (req, res, next) => {
    const userId = req.headers["x-user-id"];

    if (!userId) {
        return res.status(401).json({ message: "Not authorized, no user ID provided" });
    }

    try {
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(401).json({ message: "Not authorized, user not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error.message);
        return res.status(401).json({ message: "Not authorized" });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Not authorized as an admin" });
    }
};

module.exports = { protect, admin };

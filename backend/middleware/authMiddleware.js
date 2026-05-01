const User = require("../models/User");
const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select("-password");
            if (!user) {
                return res.status(401).json({ message: "Not authorized, user not found" });
            }
            req.user = user;
            // Add fallback x-user-id header for older routes/controllers
            req.headers["x-user-id"] = user._id.toString();
            return next();
        } catch (error) {
            console.error("JWT validation error:", error.message);
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    // Fallback to older x-user-id if token is not present
    const userId = req.headers["x-user-id"];
    if (userId) {
        try {
            const user = await User.findById(userId).select("-password");
            if (!user) {
                return res.status(401).json({ message: "Not authorized, user not found" });
            }
            req.user = user;
            return next();
        } catch (error) {
            console.error("Auth middleware error:", error.message);
            return res.status(401).json({ message: "Not authorized" });
        }
    }

    return res.status(401).json({ message: "Not authorized, no token or user ID provided" });
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Not authorized as an admin" });
    }
};

module.exports = { protect, admin };

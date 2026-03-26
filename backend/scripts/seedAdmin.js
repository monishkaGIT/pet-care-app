const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config({ path: require('path').resolve(__dirname, '..', '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected for Seeding");
    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
        process.exit(1);
    }
};

const seedAdmin = async () => {
    await connectDB();

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("admin123", salt);

        const existingAdmin = await User.findOne({ email: "admin@petcare.com" });

        if (existingAdmin) {
            existingAdmin.password = hashedPassword;
            existingAdmin.role = "admin";
            await existingAdmin.save();
            console.log("✅ Admin account successfully RESTORED.");
            console.log("Login: admin@petcare.com");
            console.log("Password: admin123");
        } else {
            await User.create({
                name: "Master Admin",
                email: "admin@petcare.com",
                password: hashedPassword,
                role: "admin"
            });
            console.log("✅ Admin account successfully CREATED.");
            console.log("Login: admin@petcare.com");
            console.log("Password: admin123");
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding admin:", error);
        process.exit(1);
    }
};

seedAdmin();

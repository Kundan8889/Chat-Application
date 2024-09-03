const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

const getUserDetailsFromToken = async (token) => {
    try {
        if (!token) {
            return {
                message: "Session expired",
                logout: true,
            };
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        const user = await UserModel.findById(decoded.id).select('-password');
        if (!user) {
            return {
                message: "User not found",
                logout: true,
            };
        }

        return user;
    } catch (error) {
        console.error("Error in token verification:", error); // Log error for debugging
        return {
            message: "Invalid token",
            logout: true,
        };
    }
}

module.exports = getUserDetailsFromToken;

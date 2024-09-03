const UserModel = require("../models/UserModel");
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function checkPassword(request, response) {
    try {
        const { password, userId } = request.body;

        // Ensure both fields are provided
        if (!password || !userId) {
            return response.status(400).json({
                message: "Password and userId are required.",
                error: true
            });
        }

        const user = await UserModel.findById(userId);

        // Check if user exists
        if (!user) {
            return response.status(404).json({
                message: "User not found.",
                error: true
            });
        }

        const verifyPassword = await bcryptjs.compare(password, user.password);

        if (!verifyPassword) {
            return response.status(400).json({
                message: "Please check password",
                error: true
            });
        }

        const tokenData = {
            id: user._id,
            email: user.email
        };

        const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        };

        return response.cookie('token', token, cookieOptions).status(200).json({
            message: "Login successfully",
            token: token,
            success: true
        });

    } catch (error) {
        console.error(error); // Log the error for debugging
        return response.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}

module.exports = checkPassword;

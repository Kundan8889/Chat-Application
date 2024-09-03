const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const UserModel = require("../models/UserModel");

async function updateUserDetails(request, response) {
    try {
        const token = request.cookies.token || "";

        // Fetch user details from token
        const user = await getUserDetailsFromToken(token);
        if (!user) {
            return response.status(401).json({
                message: "Unauthorized",
                error: true
            });
        }

        const { name, profile_pic } = request.body;

        // Validate input
        if (!name || !profile_pic) {
            return response.status(400).json({
                message: "Name and profile picture are required",
                error: true
            });
        }

        // Update user details
        const updateResult = await UserModel.updateOne(
            { _id: user._id },
            { name, profile_pic }
        );

        // Check if update was successful
        if (updateResult.modifiedCount === 0) {
            return response.status(400).json({
                message: "No changes made",
                error: true
            });
        }

        // Fetch updated user information
        const updatedUser = await UserModel.findById(user._id);
        if (!updatedUser) {
            return response.status(404).json({
                message: "User not found",
                error: true
            });
        }

        return response.json({
            message: "User updated successfully",
            data: updatedUser,
            success: true
        });

    } catch (error) {
        console.error("Error updating user details:", error); // Log the error for debugging
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true
        });
    }
}

module.exports = updateUserDetails;

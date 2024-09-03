async function logout(request, response) {
    try {
        // Define cookie options
        const cookieOptions = {
            httpOnly: true, // Ensure the cookie is not accessible via JavaScript
            secure: true,   // Cookie is only sent over HTTPS
            sameSite: 'None', // Allow cross-origin requests
            expires: new Date(0) // Set the expiration date to a past date to clear the cookie
        };

        return response
            .cookie('token', '', cookieOptions) // Clear the cookie
            .status(200)
            .json({
                message: "Logged out successfully",
                success: true
            });
    } catch (error) {
        console.error('Error logging out:', error); // Log the error
        return response.status(500).json({
            message: error.message || 'Internal Server Error',
            error: true
        });
    }
}

module.exports = logout;

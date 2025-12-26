import { autumnHandler } from "autumn-js/next";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";

export const { GET, POST } = autumnHandler({
    identify: async (request) => {
        // Get user ID from cookies
        const cookieStore = await cookies();
        const userId = cookieStore.get("user_id")?.value;

        if (!userId) {
            return {
                customerId: null,
                customerData: null,
            };
        }

        // Get user from database
        await connectDB();
        const user = await User.findById(userId);

        if (!user) {
            return {
                customerId: null,
                customerData: null,
            };
        }

        return {
            customerId: user._id,
            customerData: {
                name: user.name || user.youtubeChannelName || "User",
                email: user.email,
            },
        };
    },
});

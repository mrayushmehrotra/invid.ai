import { SecondNav } from "@/components/myComponents/nav2";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <SecondNav />
            {/* Add left padding to account for the sidebar */}
            <div className="bg-gradient-to-br from-gray-950 h-full w-full via-black to-black md:pl-[240px]">
                {children}
            </div>
        </div>
    );
}
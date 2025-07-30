import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Target, 
  Calendar, 
  BarChart3, 
  Brain, 
  Users, 
  Rocket,
  User
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Ideal Self", href: "/onboarding", icon: Target },
  { name: "Daily Check-in", href: "/checkin", icon: Calendar },
  { name: "Habit Tracker", href: "/habits", icon: BarChart3 },
  { name: "AI Blueprint", href: "/blueprint", icon: Brain },
  { name: "Accountability", href: "/accountability", icon: Users },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside className={cn("hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200", className)}>
      {/* Logo */}
      <div className="flex items-center px-6 py-6 border-b border-gray-200">
        <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
          <Rocket className="text-white w-5 h-5" />
        </div>
        <span className="ml-3 text-xl font-bold text-neutral-900">DreamMap</span>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <a className={cn(
                "flex items-center px-3 py-2 rounded-lg font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-neutral-500 hover:bg-gray-100 hover:text-neutral-900"
              )}>
                <Icon className="w-5 h-5" />
                <span className="ml-3">{item.name}</span>
              </a>
            </Link>
          );
        })}
      </nav>
      
      {/* User Profile */}
      <div className="px-4 pb-6">
        <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-neutral-900">Alex Johnson</p>
            <p className="text-xs text-neutral-500">Level 12 Dreamer</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

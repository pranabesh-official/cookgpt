"use client";

import { useState } from "react";
import { Button } from "./button";
import { ChefHatIcon, CalculatorIcon, CalendarIcon, PlusIcon, XIcon } from "./icons";

interface FloatingActionButtonProps {
  className?: string;
}

export function FloatingActionButton({ className }: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const quickActions = [
    {
      icon: CalculatorIcon,
      label: "Calorie Calculator",
      href: "#calculator",
      color: "from-orange-500 to-orange-600",
      bgColor: "from-orange-100 to-orange-200",
      darkBgColor: "dark:from-orange-900/30 dark:to-orange-800/30"
    },
    {
      icon: CalendarIcon,
      label: "Meal Planner",
      href: "#meal-planner",
      color: "from-red-500 to-red-600",
      bgColor: "from-red-100 to-red-200",
      darkBgColor: "dark:from-red-900/30 dark:to-red-800/30"
    },
    {
      icon: ChefHatIcon,
      label: "New Recipe",
      href: "#new-recipe",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "from-yellow-100 to-yellow-200",
      darkBgColor: "dark:from-yellow-900/30 dark:to-yellow-800/30"
    }
  ];

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Quick Action Buttons */}
      {isExpanded && (
        <div className="mb-4 space-y-3">
          {quickActions.map((action, index) => (
            <div
              key={action.label}
              className="flex items-center justify-end"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "slideInFromBottom 0.3s ease-out forwards"
              }}
            >
              <div className="mr-3 text-right">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 bg-white/90 dark:bg-slate-800/90 px-3 py-2 rounded-lg backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                  {action.label}
                </span>
              </div>
              <Button
                size="sm"
                className={`bg-gradient-to-r ${action.color} hover:shadow-lg transition-all duration-300 transform hover:scale-110 w-12 h-12 rounded-full p-0 shadow-xl`}
                onClick={() => {
                  // Handle navigation or action
                  setIsExpanded(false);
                }}
              >
                <action.icon className="w-5 h-5 text-white" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB Button */}
      <Button
        size="lg"
        className={`bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white w-16 h-16 rounded-full p-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 ${
          isExpanded ? "rotate-45" : "rotate-0"
        }`}
        onClick={toggleExpanded}
      >
        {isExpanded ? (
          <XIcon className="w-6 h-6" />
        ) : (
          <PlusIcon className="w-6 h-6" />
        )}
      </Button>

      <style jsx>{`
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

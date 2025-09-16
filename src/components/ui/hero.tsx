"use client";

import { Button } from "./button";
import { Card } from "./card";
import { ChefHatIcon, CalculatorIcon, CalendarIcon, SparklesIcon, StarIcon } from "./icons";

interface HeroProps {
  className?: string;
}

export function Hero({ className }: HeroProps) {
  return (
    <section className={`relative overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 dark:from-orange-900/10 dark:via-red-900/10 dark:to-yellow-900/10 py-16 sm:py-24 ${className}`}>
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-br from-orange-200/40 to-orange-300/40 dark:from-orange-900/20 dark:to-orange-800/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-br from-red-200/40 to-red-300/40 dark:from-red-900/20 dark:to-red-800/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-br from-yellow-200/40 to-yellow-300/40 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 mb-8 sm:mb-10 shadow-lg">
          <div className="mr-3 p-1.5 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg">
            <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <span className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
            AI-Powered Recipe Creation
          </span>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-slate-100 mb-6 sm:mb-8 leading-tight px-2">
          The world's smartest
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-600 to-orange-600">
            recipe manager app
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-8 sm:mb-12 max-w-3xl sm:max-w-4xl mx-auto leading-relaxed px-4">
          Smarter cooking starts here! Save recipes from anywhere, plan your week then hit the shops.
        </p>

        {/* App Store Badges */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 sm:mb-12">
          <Button size="lg" className="group bg-black hover:bg-gray-800 text-white px-8 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span>Download on the App Store</span>
            </div>
          </Button>
          
          <Button size="lg" className="group bg-black hover:bg-gray-800 text-white px-8 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
              </svg>
              <span>Get it on Google Play</span>
            </div>
          </Button>
        </div>

        {/* Web App Login */}
        <div className="mb-8 sm:mb-12">
          <Button size="lg" className="group bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
            <span className="mr-3">Login to the Web App</span>
            <div className="p-2 bg-white/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <ChefHatIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </Button>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-center mb-8 sm:mb-12">
          <div className="flex items-center space-x-1 mr-3">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className="w-6 h-6 text-yellow-400 fill-current" />
            ))}
          </div>
          <span className="text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-300">
            4.8 rating on Apple App Store & Google Play
          </span>
        </div>

        {/* USP Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl overflow-hidden">
            <div className="p-6 sm:p-8 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <CalculatorIcon className="w-7 h-7 sm:w-8 sm:h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Download for free
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Download the app and start a 14-day free trial or use CookIt for free with 20 recipes.
              </p>
            </div>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl overflow-hidden">
            <div className="p-6 sm:p-8 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <CalendarIcon className="w-7 h-7 sm:w-8 sm:h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Never lose a recipe
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Import recipes from socials, websites, scan physical recipes or create new ones with AI.
              </p>
            </div>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl overflow-hidden">
            <div className="p-6 sm:p-8 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <ChefHatIcon className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                Plan, shop & cook
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Plan your meals, create interactive shopping lists and cook with scaling, conversion & timers.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

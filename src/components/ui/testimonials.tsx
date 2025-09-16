"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "./card";
import { StarIcon, QuoteIcon } from "./icons";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
  category: string;
}

interface TestimonialsProps {
  className?: string;
}

export function Testimonials({ className }: TestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Home Chef",
      avatar: "👩‍🍳",
      content: "CookItNext has completely transformed how I plan meals. I used to throw away so much food, but now I can create delicious recipes from whatever's in my pantry. The AI suggestions are spot-on!",
      rating: 5,
      category: "Meal Planning"
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      role: "Fitness Enthusiast",
      avatar: "💪",
      content: "The calorie calculator is incredibly accurate and helps me stay on track with my nutrition goals. I love how it suggests healthy alternatives and portion sizes.",
      rating: 5,
      category: "Nutrition"
    },
    {
      id: 3,
      name: "Emma Thompson",
      role: "Busy Parent",
      avatar: "👨‍👩‍👧‍👦",
      content: "As a working mom, I need quick, healthy meals. CookItNext saves me hours of meal planning and grocery shopping. The recipes are family-friendly and always a hit!",
      rating: 5,
      category: "Family Cooking"
    },
    {
      id: 4,
      name: "David Kim",
      role: "Food Blogger",
      avatar: "📱",
      content: "The recipe generation is impressive. It creates unique combinations I never would have thought of, and the instructions are always clear and easy to follow.",
      rating: 5,
      category: "Recipe Creation"
    },
    {
      id: 5,
      name: "Lisa Patel",
      role: "Dietary Specialist",
      avatar: "🥗",
      content: "I work with clients who have specific dietary needs. CookItNext ability to adapt recipes for different restrictions while maintaining flavor is remarkable.",
      rating: 5,
      category: "Dietary Needs"
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const pauseAutoPlay = () => setIsAutoPlaying(false);
  const resumeAutoPlay = () => setIsAutoPlaying(true);

  const goToTestimonial = (index: number) => {
    setActiveIndex(index);
    pauseAutoPlay();
    // Resume auto-play after 10 seconds
    setTimeout(resumeAutoPlay, 10000);
  };

  const currentTestimonial = testimonials[activeIndex];

  return (
    <section className={`py-16 sm:py-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Loved by Home Cooks
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            See how CookItNext is transforming kitchens around the world
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 mb-12">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className={`group cursor-pointer transition-all duration-500 ${
                index === activeIndex
                  ? "scale-105 shadow-2xl border-orange-200 dark:border-orange-800"
                  : "scale-100 hover:scale-105 shadow-lg hover:shadow-xl"
              } bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 rounded-3xl overflow-hidden`}
              onClick={() => goToTestimonial(index)}
            >
              <CardContent className="p-8">
                {/* Quote Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-2xl flex items-center justify-center">
                    <QuoteIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>

                {/* Rating */}
                <div className="flex justify-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-slate-700 dark:text-slate-300 text-center mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="text-center">
                  <div className="text-4xl mb-3">{testimonial.avatar}</div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {testimonial.name}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                    {testimonial.role}
                  </p>
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-full">
                    {testimonial.category}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center space-x-3">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToTestimonial(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "bg-orange-600 scale-125"
                  : "bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="group">
            <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-2">
              50K+
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Happy Users
            </p>
          </div>
          <div className="group">
            <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 mb-2">
              100K+
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Recipes Created
            </p>
          </div>
          <div className="group">
            <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 mb-2">
              95%
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              User Satisfaction
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

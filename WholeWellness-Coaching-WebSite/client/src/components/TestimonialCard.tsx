import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Testimonial } from "@shared/schema";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <Card className="bg-white hover:shadow-lg transition-shadow">
      <CardContent className="p-8">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
            {testimonial.initial}
          </div>
          <div className="ml-4">
            <h4 className="font-semibold text-secondary">{testimonial.name}</h4>
            <p className="text-sm text-gray-600">{testimonial.category}</p>
          </div>
        </div>
        <p className="text-gray-700 italic mb-4">
          "{testimonial.content}"
        </p>
        <div className="flex text-yellow-400">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-current" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

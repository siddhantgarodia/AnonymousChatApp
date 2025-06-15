"use client";

import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import Autoplay from "embla-carousel-autoplay";
import messages from "@/messages.json";

const Home = () => {
  return (
    <>
      <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4 py-8 transition-colors">
        <section className="text-center max-w-2xl">
          <h1 className="text-4xl font-bold mb-4 transition-colors">
            Welcome to AnonChat
          </h1>
          <p className="text-lg mb-6 text-muted-foreground transition-colors">
            AnonChat is a platform for anonymous messaging. Connect with others
            without revealing your identity.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/sign-in"
              className="px-5 py-2 bg-primary text-primary-foreground rounded shadow hover:bg-primary/90 transition-colors"
            >
              Sign In
            </a>
            <a
              href="/sign-up"
              className="px-5 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition-colors"
            >
              Sign Up
            </a>
          </div>
        </section>

        <div className="mt-12 w-full max-w-md">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[Autoplay({ delay: 3000, stopOnInteraction: false })]}
          >
            <CarouselContent>
              {messages.map((message, index) => (
                <CarouselItem key={index} className="flex justify-center">
                  <Card className="w-full shadow-md bg-card text-card-foreground transition-colors">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold mb-2">
                        {message.title}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {message.content}
                      </p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </main>

      <footer className="bg-muted text-muted-foreground text-center py-6 transition-colors">
        <p>&copy; {new Date().getFullYear()} AnonChat. All rights reserved.</p>
        <p>
          <a
            href="/privacy-policy"
            className="text-primary underline hover:text-primary/80 transition-colors"
          >
            Privacy Policy
          </a>
        </p>
      </footer>
    </>
  );
};

export default Home;

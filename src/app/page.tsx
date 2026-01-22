'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Autoplay from 'embla-carousel-autoplay';
import messages from '@/messages.json';

import {
  Carousel,
  CarouselContent,
  CarouselItem
} from '@/components/ui/carousel';

export default function Home() {
  return (
    <>
      {/* Main content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-24 py-12 bg-transparent text-foreground relative overflow-hidden">

        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-orange-500/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-amber-500/10 rounded-full blur-[100px] -z-10" />

        <section className="text-center mb-8 md:mb-12 relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-700 dark:from-white dark:to-white/60 pb-4">
            Get honest feedback — <br /> anonymously and safely
          </h1>
          <p className="mt-3 md:mt-6 text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Share your link. Receive constructive messages. Stay in control.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4">
            <Link href="/sign-up">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-slow">
                Create your link
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
              <ShieldCheck className="w-4 h-4" /> AI-moderated • No login to send feedback
            </p>
          </div>
        </section>

        {/* Carousel for Messages */}
        <Carousel
          plugins={[Autoplay({ delay: 2000 })]}
          className="w-full max-w-lg md:max-w-xl mt-10 perspective-1000"
        >
          <CarouselContent>
            {messages.map((message, index) => (
              <CarouselItem key={index} className="p-4">
                <Card className="bg-card/50 border-input backdrop-blur-sm hover:bg-card/80 transition-colors duration-300">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">{message.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col md:flex-row items-start space-y-2 md:space-y-0 md:space-x-4">
                    <Mail className="flex-shrink-0 text-orange-400" />
                    <div>
                      <p className="text-muted-foreground">{message.content}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        {message.received}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </main>

      {/* Footer */}
      <footer className="text-center p-6 bg-transparent text-slate-500 text-sm">
        © 2023 Mystery Message. All rights reserved.
      </footer>
    </>
  );
}
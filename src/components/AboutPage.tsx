"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Users, Target, Lightbulb, Heart, ArrowLeft, MapPin, Shield, Zap } from "lucide-react";
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../utils/translations';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

interface MagicTextProps {
  text: string;
}

interface WordProps {
  children: string;
  progress: any;
  range: number[];
}

const Word: React.FC<WordProps> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0, 1]);

  return (
    <span className="relative mt-[12px] mr-1 text-2xl md:text-3xl font-semibold">
      <span className="absolute opacity-20">{children}</span>
      <motion.span style={{ opacity: opacity }}>{children}</motion.span>
    </span>
  );
};

const MagicText: React.FC<MagicTextProps> = ({ text }) => {
  const container = useRef(null);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.9", "start 0.25"],
  });

  const words = text.split(" ");

  return (
    <p ref={container} className="flex flex-wrap leading-[0.5] p-4">
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;

        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]}>
            {word}
          </Word>
        );
      })}
    </p>
  );
};

const IMG_PADDING = 12;

interface TextParallaxContentProps {
  imgUrl: string;
  subheading: string;
  heading: string;
  children: React.ReactNode;
}

const TextParallaxContent: React.FC<TextParallaxContentProps> = ({ 
  imgUrl, 
  subheading, 
  heading, 
  children 
}) => {
  return (
    <div
      style={{
        paddingLeft: IMG_PADDING,
        paddingRight: IMG_PADDING,
      }}
    >
      <div className="relative h-[150vh]">
        <StickyImage imgUrl={imgUrl} />
        <OverlayCopy heading={heading} subheading={subheading} />
      </div>
      {children}
    </div>
  );
};

interface StickyImageProps {
  imgUrl: string;
}

const StickyImage: React.FC<StickyImageProps> = ({ imgUrl }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["end end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <motion.div
      style={{
        backgroundImage: `url(${imgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: `calc(100vh - ${IMG_PADDING * 2}px)`,
        top: IMG_PADDING,
        scale,
      }}
      ref={targetRef}
      className="sticky z-0 overflow-hidden rounded-3xl"
    >
      <motion.div
        className="absolute inset-0 bg-neutral-950/70"
        style={{
          opacity,
        }}
      />
    </motion.div>
  );
};

interface OverlayCopyProps {
  subheading: string;
  heading: string;
}

const OverlayCopy: React.FC<OverlayCopyProps> = ({ subheading, heading }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [250, -250]);
  const opacity = useTransform(scrollYProgress, [0.25, 0.5, 0.75], [0, 1, 0]);

  return (
    <motion.div
      style={{
        y,
        opacity,
      }}
      ref={targetRef}
      className="absolute left-0 top-0 flex h-screen w-full flex-col items-center justify-center text-white"
    >
      <p className="mb-2 text-center text-lg md:mb-4 md:text-2xl">
        {subheading}
      </p>
      <p className="text-center text-3xl font-bold md:text-6xl">{heading}</p>
    </motion.div>
  );
};

interface StoryContentProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const StoryContent: React.FC<StoryContentProps> = ({ icon, title, description }) => {
  const { theme } = useTheme();
  
  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12">
      <div className="col-span-1 md:col-span-4 flex flex-col items-start">
        <div className={`mb-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
          {icon}
        </div>
        <h2 className={`text-2xl md:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h2>
      </div>
      <div className="col-span-1 md:col-span-8">
        <p className={`mb-4 text-lg md:text-xl leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          {description}
        </p>
      </div>
    </div>
  );
};

function AboutPage({ onNavigate }: AboutPageProps) {
  const { language, theme } = useTheme();
  const t = translations[language];

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Navigation Header */}
      <div className={`fixed top-0 left-0 right-0 z-50 ${theme === 'dark' ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'} backdrop-blur-md border-b`}>
        <div className="flex items-center gap-4 p-4 max-w-7xl mx-auto">
          <button
            onClick={() => onNavigate('profile')}
            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}`}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {t.aboutNivaran}
          </h1>
        </div>
      </div>

      {/* Hero Section */}
      <section className={`relative min-h-screen flex items-center justify-center pt-20 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'}`}>
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Our <span className="text-blue-500">Journey</span>
            </h1>
            <p className={`text-lg md:text-xl lg:text-2xl mb-8 leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Empowering communities through technology to create cleaner, safer, and more responsive cities
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className={`flex items-center justify-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
            >
              <span>Scroll to discover our story</span>
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* The Problem Section */}
      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1573812956395-74bd9f68bc45?q=80&w=2670&auto=format&fit=crop"
        subheading="The Problem"
        heading="Civic Issues Go Unheard"
      >
        <StoryContent
          icon={<Target className="w-8 h-8 text-blue-500" />}
          title="Identifying the Challenge"
          description="Traditional civic reporting systems are slow, bureaucratic, and often leave citizens feeling unheard. We recognized the need for a modern platform that bridges the gap between communities and local governments, making civic engagement accessible to everyone."
        />
      </TextParallaxContent>

      {/* The Vision Section */}
      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2669&auto=format&fit=crop"
        subheading="The Vision"
        heading="Technology for Change"
      >
        <StoryContent
          icon={<Lightbulb className="w-8 h-8 text-blue-500" />}
          title="Our Innovation"
          description="We envisioned a platform that combines the power of AI, real-time reporting, and community engagement. Nivaran transforms how citizens interact with their local governments, creating transparency and fostering collaborative problem-solving."
        />
      </TextParallaxContent>

      {/* The Journey Section */}
      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2670&auto=format&fit=crop"
        subheading="The Impact"
        heading="Building Stronger Communities"
      >
        <StoryContent
          icon={<Users className="w-8 h-8 text-blue-500" />}
          title="Growing Together"
          description="From a simple idea to a platform serving thousands of users, Nivaran has facilitated the resolution of countless civic issues. Our community of engaged citizens, responsive governments, and innovative features continues to grow every day."
        />
      </TextParallaxContent>

      {/* Mission Statement with Magic Text */}
      <section className={`relative py-24 md:py-48 ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-blue-50/30'}`}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Our Mission
            </h2>
          </div>
          <div className="max-w-6xl mx-auto">
            <MagicText
              text="We believe every citizen deserves to be heard. Our mission is to create technology that empowers communities, promotes transparency, and transforms civic engagement from a bureaucratic process into a collaborative journey toward better cities."
            />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={`py-24 md:py-32 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              What Drives Us
            </h2>
            <p className={`text-lg md:text-xl max-w-3xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Our core values shape everything we do, from product development to community engagement
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <MapPin className="w-8 h-8 text-blue-500" />,
                title: "Community-Centered Design",
                description: "Every feature starts with understanding real community needs and challenges."
              },
              {
                icon: <Shield className="w-8 h-8 text-blue-500" />,
                title: "Transparency & Trust",
                description: "Building trust through open communication and accountable governance."
              },
              {
                icon: <Zap className="w-8 h-8 text-blue-500" />,
                title: "Innovation for Impact",
                description: "Leveraging cutting-edge technology to create meaningful civic change."
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`text-center p-6 rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="mb-4 flex justify-center">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                    {value.icon}
                  </div>
                </div>
                <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {value.title}
                </h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-24 md:py-32 ${theme === 'dark' ? 'bg-blue-900/10' : 'bg-blue-50'}`}>
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Join Our Journey
            </h2>
            <p className={`text-lg md:text-xl mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Be part of the movement to create more responsive, transparent, and connected communities.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              Start Reporting Issues
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer spacing for mobile navigation */}
      <div className="h-20 md:h-0"></div>
    </div>
  );
}

export default AboutPage;

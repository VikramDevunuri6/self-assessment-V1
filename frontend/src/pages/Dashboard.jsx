import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { getLatestSession } from "../services/assessmentService";

import SmoothScroll from "../components/dashboard/SmoothScroll";
import BackgroundLayers from "../components/dashboard/BackgroundLayers";
import CustomCursor from "../components/dashboard/CustomCursor";
import ScrollProgress from "../components/dashboard/ScrollProgress";
import SectionIndicators from "../components/dashboard/SectionIndicators";
import MagneticButton from "../components/dashboard/MagneticButton";
import HeroVisual from "../components/dashboard/HeroVisual";
import { RevealLines, RevealUp } from "../components/dashboard/RevealText";
import StatCard from "../components/dashboard/StatCard";
import Timeline from "../components/dashboard/Timeline";
import StoryStack from "../components/dashboard/StoryStack";
import StrengthPill from "../components/dashboard/StrengthPill";
import CTASection from "../components/dashboard/CTASection";

import "../styles/Dashboard.css";

const SECTIONS = ["hero", "journey", "stats", "story", "strengths", "cta"];

const STAGES = [
  { number: "01", title: "BEFORE", text: "What motivates you to begin?", kind: "before" },
  { number: "02", title: "DURING", text: "What keeps you moving?", kind: "during" },
  { number: "03", title: "AFTER", text: "What remains after completion?", kind: "after" },
];

const STATS = [
  { title: "Assessment Score", value: "92%" },
  { title: "Completion Rate", value: "100%" },
  { title: "Top Strength", value: "Leadership" },
  { title: "Growth Index", value: "89%" },
];

const STORY_CARDS = [
  { title: "Started", text: "Curiosity drives exploration." },
  { title: "Progressed", text: "Discipline shapes consistency." },
  { title: "Achieved", text: "Reflection creates growth." },
];

const STRENGTHS = ["Leadership", "Creativity", "Empathy", "Discipline", "Confidence", "Problem Solving"];

const EASE = [0.16, 1, 0.3, 1];

export default function Dashboard() {
  const navigate = useNavigate();
  const [latestSession, setLatestSession] = useState(null);

  useEffect(() => {
    async function loadLatestSession() {
      try {
        const data = await getLatestSession();
        setLatestSession(data);
      } catch (err) {
        console.error("Failed to load latest session", err);
      }
    }

    loadLatestSession();
  }, []);

  const handleViewAssessment = () => navigate("/assessment");

  const handleViewReport = () => {
    if (latestSession?.hasResult) {
      navigate(`/report/${latestSession.sessionId}`);
    } else {
      navigate("/assessment");
    }
  };

  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroScale = useTransform(heroProgress, [0, 1], [1, 0.92]);
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0]);
  const heroY = useTransform(heroProgress, [0, 1], [0, 120]);
  const heroVisualY = useTransform(heroProgress, [0, 1], [0, -90]);
  const heroVisualRotate = useTransform(heroProgress, [0, 1], [0, 10]);

  return (
    <SmoothScroll>
      <motion.div
        className="dashboard"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <BackgroundLayers />
        <CustomCursor />
        <ScrollProgress />
        <SectionIndicators sections={SECTIONS} />

        {/* Hero */}
        <section id="hero" ref={heroRef} className="hero">
          <motion.div className="hero-grid" style={{ scale: heroScale, opacity: heroOpacity, y: heroY }}>
            <div className="hero-content">
              <motion.span
                className="hero-tag"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                ✦ SELF DISCOVERY DASHBOARD
              </motion.span>

              <h1 className="hero-title">
                <RevealLines lines={["Discover", "Your Pattern.", "Your Potential."]} delay={0.25} />
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.95, ease: EASE }}
              >
                Track your personality journey, strengths, growth patterns and
                assessment insights through a beautifully crafted experience.
              </motion.p>

              <motion.div
                className="hero-buttons"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.15, ease: EASE }}
              >
                <MagneticButton className="primary-btn" onClick={handleViewAssessment}>
                  View Assessment
                </MagneticButton>
                <MagneticButton className="secondary-btn" onClick={handleViewReport}>
                  Explore Results
                </MagneticButton>
              </motion.div>
            </div>

            <motion.div className="hero-visual-wrap" style={{ y: heroVisualY, rotate: heroVisualRotate }}>
              <HeroVisual />
            </motion.div>
          </motion.div>
        </section>

        {/* Journey */}
        <section id="journey" className="journey">
          <Timeline stages={STAGES} />
        </section>

        {/* Stats */}
        <section id="stats" className="stats">
          {STATS.map((stat, i) => (
            <StatCard key={stat.title} title={stat.title} value={stat.value} index={i} />
          ))}
        </section>

        {/* Story */}
        <section id="story" className="story">
          <StoryStack
            title="Your Growth Story"
            description="Every decision leaves a pattern. This dashboard helps you understand how your motivations evolve before, during and after important experiences."
            cards={STORY_CARDS}
          />
        </section>

        {/* Strengths */}
        <section id="strengths" className="strengths">
          <RevealUp>
            <h2>Core Strengths</h2>
          </RevealUp>

          <div className="strength-grid">
            {STRENGTHS.map((strength, i) => (
              <StrengthPill key={strength} index={i}>
                {strength}
              </StrengthPill>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section id="cta" className="cta">
          <CTASection
            title="Ready to unlock your full potential?"
            description="Explore your complete personality report and growth roadmap."
            buttonText="VIEW FULL REPORT"
            onButtonClick={handleViewReport}
          />
        </section>
      </motion.div>
    </SmoothScroll>
  );
}

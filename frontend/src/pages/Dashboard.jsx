import { useEffect } from "react";
import { motion } from "framer-motion";
import { getProfile } from "../services/authService";
import "../styles/Dashboard.css";

export default function Dashboard() {
  useEffect(() => {
    async function test() {
      try {
        const data = await getProfile();
        console.log("DATA:", data);
      } catch (err) {
        console.error("ERROR:", err);
      }
    }

    test();
  }, []);

  return (
    <div className="dashboard">
      {/* Hero */}
      <section className="hero">
        <div className="gradient-blob"></div>

        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <span className="hero-tag">✦ SELF DISCOVERY DASHBOARD</span>

          <h1>
            Discover
            <br />
            Your Pattern.
            <br />
            Your Potential.
          </h1>

          <p>
            Track your personality journey, strengths, growth patterns and
            assessment insights through a beautifully crafted experience.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">View Assessment</button>
            <button className="secondary-btn">Explore Results</button>
          </div>
        </motion.div>
      </section>

      {/* Journey */}
      <section className="journey">
        <div className="journey-item">
          <span>01</span>
          <h2>BEFORE</h2>
          <p>What motivates you to begin?</p>
        </div>

        <div className="journey-item">
          <span>02</span>
          <h2>DURING</h2>
          <p>What keeps you moving?</p>
        </div>

        <div className="journey-item">
          <span>03</span>
          <h2>AFTER</h2>
          <p>What remains after completion?</p>
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="stat-card">
          <h3>Assessment Score</h3>
          <h1>92%</h1>
        </div>

        <div className="stat-card">
          <h3>Completion Rate</h3>
          <h1>100%</h1>
        </div>

        <div className="stat-card">
          <h3>Top Strength</h3>
          <h1>Leadership</h1>
        </div>

        <div className="stat-card">
          <h3>Growth Index</h3>
          <h1>89%</h1>
        </div>
      </section>

      {/* Story */}
      <section className="story">
        <div className="story-left">
          <h2>Your Growth Story</h2>

          <p>
            Every decision leaves a pattern. This dashboard helps you understand
            how your motivations evolve before, during and after important
            experiences.
          </p>
        </div>

        <div className="story-right">
          <div className="timeline-card">
            <h3>Started</h3>
            <p>Curiosity drives exploration.</p>
          </div>

          <div className="timeline-card">
            <h3>Progressed</h3>
            <p>Discipline shapes consistency.</p>
          </div>

          <div className="timeline-card">
            <h3>Achieved</h3>
            <p>Reflection creates growth.</p>
          </div>
        </div>
      </section>

      {/* Strengths */}
      <section className="strengths">
        <h2>Core Strengths</h2>

        <div className="strength-grid">
          <div className="strength-card">Leadership</div>
          <div className="strength-card">Creativity</div>
          <div className="strength-card">Empathy</div>
          <div className="strength-card">Discipline</div>
          <div className="strength-card">Confidence</div>
          <div className="strength-card">Problem Solving</div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta-box">
          <h2>Ready to unlock your full potential?</h2>

          <p>
            Explore your complete personality report and growth roadmap.
          </p>

          <button>VIEW FULL REPORT</button>
        </div>
      </section>
    </div>
  );
}
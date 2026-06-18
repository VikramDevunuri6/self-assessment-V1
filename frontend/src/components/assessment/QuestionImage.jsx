import { useState } from "react";
import { motion } from "framer-motion";

const easeOut = [0.22, 1, 0.36, 1];

function QuestionImageInner({ src, alt, children, className = "" }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`qi-wrapper ${className}`}>
      {!loaded && !error && (
        <div className="qi-shimmer" aria-hidden="true" />
      )}

      {error ? (
        <div className="qi-fallback" role="img" aria-label={alt}>
          <span className="qi-fallback-icon" aria-hidden="true">📷</span>
          <span className="qi-fallback-text">{alt}</span>
        </div>
      ) : (
        <motion.img
          src={src}
          alt={alt}
          className="qi-img"
          style={{ opacity: loaded ? 1 : 0 }}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          initial={{ scale: 1.03 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.35, ease: easeOut }}
          loading="eager"
          draggable={false}
        />
      )}

      {children}
    </div>
  );
}

/**
 * Renders a portrait image wrapper with loading shimmer and error fallback.
 * The key={src} on the inner component resets state automatically when src changes.
 * Pass children to render overlay zones inside the same relative container.
 */
export default function QuestionImage({ src, alt, children, className = "" }) {
  return (
    <QuestionImageInner key={src} src={src} alt={alt} className={className}>
      {children}
    </QuestionImageInner>
  );
}

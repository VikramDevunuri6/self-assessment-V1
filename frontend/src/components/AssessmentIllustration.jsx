import { motion } from "framer-motion";

export default function AssessmentIllustration() {
  return (
    <motion.div
      className="illustration-wrap"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.svg
        viewBox="0 0 400 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-hidden="true"
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* soft background blobs */}
        <circle cx="332" cy="74" r="64" fill="#EFF6FF" />
        <circle cx="58" cy="332" r="86" fill="#EFF6FF" />

        {/* clipboard card */}
        <rect x="90" y="56" width="220" height="304" rx="20" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
        <rect x="160" y="40" width="80" height="28" rx="8" fill="#2563EB" />

        {/* checklist rows */}
        <g>
          <circle cx="128" cy="128" r="14" fill="#2563EB" />
          <path d="M122 128l4 4 9-9" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="156" y="121" width="120" height="12" rx="6" fill="#E2E8F0" />
        </g>

        <g>
          <circle cx="128" cy="180" r="14" fill="#2563EB" />
          <path d="M122 180l4 4 9-9" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="156" y="173" width="100" height="12" rx="6" fill="#E2E8F0" />
        </g>

        <g>
          <circle cx="128" cy="232" r="14" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <rect x="156" y="225" width="110" height="12" rx="6" fill="#E2E8F0" />
        </g>

        <g>
          <circle cx="128" cy="284" r="14" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <rect x="156" y="277" width="80" height="12" rx="6" fill="#E2E8F0" />
        </g>

        {/* floating ring accent */}
        <motion.circle
          cx="352"
          cy="312"
          r="22"
          fill="none"
          stroke="#BFDBFE"
          strokeWidth="6"
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />

        {/* floating dot accent */}
        <motion.circle
          cx="56"
          cy="76"
          r="13"
          fill="#60A5FA"
          animate={{ y: [0, 16, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />

        {/* floating check badge */}
        <motion.g
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
        >
          <rect x="34" y="160" width="60" height="60" rx="16" fill="#2563EB" />
          <path
            d="M52 192l11 11 19-22"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </motion.g>
      </motion.svg>
    </motion.div>
  );
}

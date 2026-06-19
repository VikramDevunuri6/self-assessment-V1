import {
  Sparkles, Calendar, ShieldCheck, CheckCircle2, Target, Clock, Layers, Flag, Trophy,
  TrendingUp, Brain, Users, Lightbulb, Rocket, BookOpen, Briefcase, BarChart3, Compass,
  MessageCircle, GraduationCap, Phone, Mail, Globe, QrCode, UserCircle2, Code2, Star,
} from "lucide-react";

/**
 * Icon-name -> lucide component map, keyed identically to the backend's
 * hand-rolled charts/icons.js so the same lookups (e.g. CAREER_POTENTIAL
 * `icon` fields, mindset `icon` fields) work unmodified on both sides.
 */
export const REPORT_ICONS = {
  sparkles: Sparkles,
  calendar: Calendar,
  shieldCheck: ShieldCheck,
  checkCircle: CheckCircle2,
  target: Target,
  clock: Clock,
  layers: Layers,
  flag: Flag,
  trophy: Trophy,
  trendUp: TrendingUp,
  brain: Brain,
  users: Users,
  lightbulb: Lightbulb,
  rocket: Rocket,
  book: BookOpen,
  briefcase: Briefcase,
  barChart: BarChart3,
  compass: Compass,
  messageCircle: MessageCircle,
  graduationCap: GraduationCap,
  phone: Phone,
  mail: Mail,
  globe: Globe,
  qrCode: QrCode,
  userCircle: UserCircle2,
  code: Code2,
  star: Star,
};

export function ReportIcon({ name, size = 14, ...rest }) {
  const Cmp = REPORT_ICONS[name] || Sparkles;
  return <Cmp size={size} {...rest} />;
}

export function IconBadge({ name, color, size = 30, iconSize, className = "", style = {} }) {
  return (
    <span
      className={`v1x-icon-badge ${className}`}
      style={{ width: size, height: size, background: `${color}1f`, color, ...style }}
    >
      <ReportIcon name={name} size={iconSize || Math.round(size * 0.52)} />
    </span>
  );
}

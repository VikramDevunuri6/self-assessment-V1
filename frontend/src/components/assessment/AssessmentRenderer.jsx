import { motion, AnimatePresence } from "framer-motion";
import questionsConfig from "../../data/questions.json";
import InstagramStoryQuestion from "./InstagramStoryQuestion";
import ScenarioQuestion from "./ScenarioQuestion";
import SliderQuestion from "./SliderQuestion";
import ThisOrThatQuestion from "./ThisOrThatQuestion";

const easeOut = [0.22, 1, 0.36, 1];

const stageVariants = {
  enter: { opacity: 0, y: 24 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
};

/**
 * Returns the section type for a question, sourced from the backend's
 * question_type field. Falls back to "scenario" for any unmapped question.
 */
export function getSectionType(question) {
  return question?.question_type || "scenario";
}

/**
 * Routes the current question to the correct section renderer.
 * questionIndex is 0-based; questionNumber is questionIndex + 1.
 */
export default function AssessmentRenderer({
  question,
  questionIndex,
  answer,
  sliderValue,
  onSelect,
  onSliderChange,
}) {
  const questionNumber = questionIndex + 1;
  const sectionType = getSectionType(question);
  const { overlays } = questionsConfig;

  const imageSrc = question.image_url || `/questions/q${questionNumber}.png`;

  const sharedProps = { question, questionNumber, answer, imageSrc };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        variants={stageVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.35, ease: easeOut }}
        style={{ width: "100%" }}
      >
        {sectionType === "instagram" && (
          <InstagramStoryQuestion
            {...sharedProps}
            onSelect={onSelect}
          />
        )}

        {sectionType === "scenario" && (
          <ScenarioQuestion
            {...sharedProps}
            onSelect={onSelect}
          />
        )}

        {sectionType === "slider" && (
          <SliderQuestion
            {...sharedProps}
            savedOptionId={answer}
            sliderValue={sliderValue}
            onSliderChange={onSliderChange}
          />
        )}

        {sectionType === "thisorthat" && (
          <ThisOrThatQuestion
            {...sharedProps}
            onSelect={onSelect}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

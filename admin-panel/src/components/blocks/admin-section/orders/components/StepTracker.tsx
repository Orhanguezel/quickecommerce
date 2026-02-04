import StepCompleted from "@/assets/icons/StepCompleted";
import StepPandding from "@/assets/icons/StepPandding";
import { motion } from "framer-motion";
import React from "react";
interface Step {
  title: string;
  icon: React.ReactNode;
  canGoBackOnly?: boolean;
  subtitle?: string;
  hint?: string;
}
interface StepTrackerProps {
  steps: Step[];
  activeStep: number;
  setActiveStep?: (index: number) => void;
}

const StepTracker: React.FC<StepTrackerProps> = ({
  steps,
  activeStep,
  setActiveStep,
}) => {
  return (
    <div className="flex justify-center my-6 w-full">
      <div className="flex justify-between w-full">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="text-center cursor-pointer w-full sm:w-1/2 md:w-1/4"
            initial={{
              color: index <= activeStep ? "#3B82F6" : "#9CA3AF", // Blue for active/completed, gray for pending
            }}
            animate={{
              color: index <= activeStep ? "#3B82F6" : "#9CA3AF",
            }}
            transition={{
              type: "tween",
              duration: 0.3,
              ease: "easeInOut",
            }}
          >
            <div className="flex items-center justify-between">
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: activeStep === index ? 1 : 1,
                  opacity: 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
              >
                {activeStep > index ? (
                  <StepCompleted
                    width={50}
                    height={50}
                    icon={step.icon}
                    iconColor="white"
                    background="#568BFF"
                  />
                ) : index === activeStep ? (
                  <StepCompleted
                    width={50}
                    height={50}
                    icon={step.icon}
                    iconColor="white"
                    background="#568BFF"
                  />
                ) : (
                  <StepPandding
                    width={50}
                    height={50}
                    icon={step.icon}
                    iconColor="#999b9e"
                  />
                )}
              </motion.span>
              {index < steps.length - 1 && (
                <motion.div
                  //@ts-ignore
                  className={`step-line h-[4px] mx-3 flex-grow rounded-md ${
                    index < activeStep
                      ? "bg-[#568BFF]" // Completed steps
                      : index === activeStep
                      ? "bg-gradient-to-r from-[#568BFF] to-[#E6E7E9]" // Active step
                      : "bg-[#E6E7E9]" // Pending steps
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: 0.5,
                    ease: "easeInOut",
                  }}
                />
              )}
            </div>
            <motion.div
              className="mt-2 text-start hidden md:block leading-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <p className="text-sm sm:text-base font-medium">{step.title}</p>

              {step.subtitle && (
                <p className="text-xs text-gray-500">{step.subtitle}</p>
              )}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StepTracker;

"use client";

import { motion } from "framer-motion";

export default function Metrics() {
  const metricsData = [
    { value: "19", label: "Subjects Covered" },
    { value: "1000+", label: "Hours of Lectures" },
    { value: "50+", label: "Active Students" },
    { value: "Zero", label: "Buffering" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <section className="mx-auto w-full max-w-[1536px] px-3 py-6 md:px-5 md:py-12">
      <div className="rounded-[1.5rem] border border-[rgba(30,50,90,0.05)] bg-[rgba(30,50,90,0.02)] p-8 md:rounded-[3rem] md:p-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-8 divide-[rgba(30,50,90,0.1)] sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x"
        >
          {metricsData.map((metric, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex flex-col items-center justify-center px-4 text-center"
            >
              <h2 className="mb-2 text-4xl font-bold text-gray-900 md:text-5xl">
                {metric.value}
              </h2>
              <p className="text-sm font-medium tracking-wide text-gray-500 uppercase md:text-base">
                {metric.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

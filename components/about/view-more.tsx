"use client"
import { Button } from '../ui/button'
import  { useState } from 'react'
import { Collapsible } from '../ui/collapsible'
import { CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { ChevronDown, ChevronUp } from 'lucide-react'

import { motion, AnimatePresence } from 'motion/react'
export const ViewMore = ()=> {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible className="sm:hidden">
      <p className="md:text-xl max-w-6xl text-sm  text-[rgba(58,63,187,1)]">
        <span className="font-bold text-[#3d4fcf]">Bait AI</span> is an <span className="font-bold">AI-interview</span > platform designed to make hiring faster, fairer, and more effective. We help organizations streamline screening and identify high-quality candidates through intelligent, structured AI interviews, while
      </p>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <CollapsibleContent forceMount>
              <p className="md:text-xl max-w-6xl text-sm text-[rgba(58,63,187,1)]">
                empowering candidates to practice and prepare with realistic mock interviews, instant feedback, and performance insights. By reducing bias, saving recruiter and interviewer time, and improving candidate readiness, BAIT AI bridges the gap between talent and opportunity—turning interviews into a skill-first, confidence-driven experience where true potential stands out.
              </p>
            </CollapsibleContent>
          </motion.div>
        )}
      </AnimatePresence>

      <CollapsibleTrigger className="mt-2 flex items-center gap-1 text-sm font-medium text-primary">
        {open ? (
          <Button className="text-[rgba(107,124,255,1)] bg-transparent font-semibold text-sm p-0 m-0 -translate-x-2 " asChild onClick={() => setOpen(!open)}>
            <span>View Less <ChevronUp className="h-2 w-2" /></span>
          </Button>
        ) : (
          <Button className="text-[rgba(107,124,255,1)] bg-transparent font-semibold text-sm p-0 m-0 -translate-x-2 " asChild onClick={() => setOpen(!open)}>
            <span>View More <ChevronDown className="h-2 w-2" /></span>
          </Button>
        )}
      </CollapsibleTrigger>
    </Collapsible>
  )
}

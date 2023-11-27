import { hoursToSeconds } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { useTimerContext } from "../timer-context";

export function TimeControls() {
	const { onGoingTask } = useTimerContext();

	return (
		<AnimatePresence initial={false}>{!onGoingTask && <TimeControlsInner />}</AnimatePresence>
	);
}

function TimeControlsInner() {
	const { form } = useTimerContext();

	function addTime(seconds: number) {
		const newTime = form.getValues("seconds") + seconds;
		const max = hoursToSeconds(2);

		if (newTime > max) {
			toast.warning("cant add more than 2 hours");
			form.setValue("seconds", max);
			return;
		}

		form.setValue("seconds", form.getValues("seconds") + seconds);
	}

	function subtractTime(seconds: number) {
		const newTime = form.getValues("seconds") - seconds;

		if (newTime < 0) {
			form.setValue("seconds", 0);
		} else {
			form.setValue("seconds", newTime);
		}
	}

	return (
		<motion.fieldset
			initial={{ opacity: 0, height: 0 }}
			animate={{ opacity: 1, height: "auto" }}
			exit={{ opacity: 0, height: 0 }}
			transition={{
				duration: 0.4,
				mass: 0.1,
				type: "spring",
			}}
			className="flex w-full items-center justify-center"
		>
			<legend className="sr-only">select duration</legend>

			<div className="flex w-full gap-2 pt-8 max-w-[250px]">
				<div className="flex w-full flex-col gap-2 rounded-2xl border border-gray-800 bg-gray-950/50 p-2">
					<Button className="w-full " onClick={() => addTime(1800)}>
						<span className="flex gap-1 items-center">
							<Plus
								aria-label="plus"
								strokeWidth={1.8}
								className="h-[16px] w-[16px]"
							/>{" "}
							<span>30 min</span>
						</span>
					</Button>
					<Button className="w-full p-2 gap-1" onClick={() => subtractTime(1800)}>
						<Minus aria-label="minus" strokeWidth={1.8} className="h-[16px] w-[16px]" />{" "}
						30 min
					</Button>
				</div>
				<div className="flex w-full flex-col gap-2 rounded-2xl border border-gray-800 bg-gray-950/50 p-2">
					<Button className="w-full p-2 gap-1" onClick={() => addTime(300)}>
						<Plus aria-label="plus" strokeWidth={1.8} className="h-[16px] w-[16px]" /> 5
						min
					</Button>
					<Button className="w-full p-2 gap-1" onClick={() => subtractTime(300)}>
						<Minus aria-label="minus" strokeWidth={1.8} className="h-[16px] w-[16px]" />{" "}
						5 min
					</Button>
				</div>
			</div>
		</motion.fieldset>
	);
}

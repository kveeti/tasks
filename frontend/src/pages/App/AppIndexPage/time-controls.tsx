import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { StartTaskForm } from "./AppIndexPage";

export function TimeControls({ form }: { form: StartTaskForm }) {
	function addTime(seconds: number) {
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
		<motion.div
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
			<div className="flex w-full max-w-[260px] gap-2 pt-8">
				<div className="flex w-full flex-col gap-2 rounded-2xl border border-gray-800 bg-gray-950/50 p-2">
					<Button
						className="w-full p-2"
						variant="secondary"
						onClick={() => addTime(1800)}
					>
						<Plus strokeWidth={1.8} className="h-[16px] w-[16px]" /> 30 min
					</Button>
					<Button
						className="w-full p-2"
						variant="secondary"
						onClick={() => subtractTime(1800)}
					>
						<Minus strokeWidth={1.8} className="h-[16px] w-[16px]" /> 30 min
					</Button>
				</div>
				<div className="flex w-full flex-col gap-2 rounded-2xl border border-gray-800 bg-gray-950/50 p-2">
					<Button className="w-full p-2" variant="secondary" onClick={() => addTime(300)}>
						<Plus strokeWidth={1.8} className="h-[16px] w-[16px]" /> 5 min
					</Button>
					<Button
						className="w-full p-2"
						variant="secondary"
						onClick={() => subtractTime(300)}
					>
						<Minus strokeWidth={1.8} className="h-[16px] w-[16px]" /> 5 min
					</Button>
				</div>
			</div>
		</motion.div>
	);
}

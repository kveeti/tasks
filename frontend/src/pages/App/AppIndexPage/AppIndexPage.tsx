import { useMutation } from "@tanstack/react-query";
import { addSeconds } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Time } from "@/Ui/Counter";
import { Button } from "@/Ui/NewButton";
import { LinkButton } from "@/Ui/NewLink";
import { type DbTask, addNotSynced, db } from "@/db/db";
import { apiRequest } from "@/utils/api/apiRequest";
import { createId } from "@/utils/createId";

import { useTimerContext } from "../TimerContext";
import { WithAnimation } from "../WithAnimation";
import { SelectTag } from "./SelectTag";

export function AppIndexPage() {
	const { selectedTagTime, selectedTag, dbTags } = useTimerContext();

	const [time, setTime] = useState(0);

	const isRunning = !!selectedTagTime;

	const addNotifMutation = useMutation<
		void,
		unknown,
		{ title: string; message: string; send_at: string }
	>((body) =>
		apiRequest({
			method: "POST",
			path: "/notifs",
			body,
		})
	);

	function addTime(seconds: number) {
		setTime(time + seconds);
	}

	function subtractTime(seconds: number) {
		const newTime = time - seconds;

		if (newTime < 0) {
			setTime(0);
		} else {
			setTime(newTime);
		}
	}

	async function startTimer() {
		if (!selectedTag) return toast.error("Select a tag first");
		if (!time) return toast.error("Add some time first");

		const expires_at = addSeconds(new Date(), time);

		const task: DbTask = {
			id: createId(),
			tag_id: selectedTag.id,
			is_manual: false,
			started_at: new Date(),
			expires_at,
			stopped_at: null,
			deleted_at: null,
			created_at: new Date(),
			updated_at: new Date(),
		};

		await Promise.all([
			addNotifMutation.mutateAsync({
				title: "Timer finished",
				message: `Your ${selectedTag.label} timer has finished`,
				send_at: expires_at.toISOString(),
			}),
			db.tasks.add(task),
			addNotSynced(task.id, "task"),
		]);
	}

	function stopTimer() {
		if (!selectedTagTime) return;

		db.tasks.update(selectedTagTime.id, {
			stopped_at: new Date(),
			updated_at: new Date(),
		});
	}

	return (
		<WithAnimation>
			<div className="flex h-full w-full flex-col items-center justify-center p-8">
				<h2 className="rounded-3xl border border-gray-800 bg-gray-950/50 p-4 font-bold text-gray-50">
					<Time seconds={isRunning ? selectedTagTime.timeUntilExpiry : time} />
				</h2>

				<AnimatePresence initial={false}>
					{!isRunning && (
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
									<Button className="w-full p-2" onPress={() => addTime(1800)}>
										<Plus strokeWidth={1.8} className="h-[16px] w-[16px]" /> 30
										min
									</Button>
									<Button
										className="w-full p-2"
										onPress={() => subtractTime(1800)}
									>
										<Minus strokeWidth={1.8} className="h-[16px] w-[16px]" /> 30
										min
									</Button>
								</div>
								<div className="flex w-full flex-col gap-2 rounded-2xl border border-gray-800 bg-gray-950/50 p-2">
									<Button className="w-full p-2" onPress={() => addTime(5)}>
										<Plus strokeWidth={1.8} className="h-[16px] w-[16px]" /> 5
										min
									</Button>
									<Button
										className="w-full p-2"
										onPress={() => subtractTime(300)}
									>
										<Minus strokeWidth={1.8} className="h-[16px] w-[16px]" /> 5
										min
									</Button>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				<div className="my-8">
					{isRunning ? (
						<span className="flex items-center justify-center rounded-xl bg-gray-600 px-4 py-2">
							<div className="flex items-center gap-2">
								<div
									className="h-3 w-3 rounded-full"
									style={{ backgroundColor: selectedTag?.color }}
								/>

								<span>{selectedTag?.label}</span>
							</div>
						</span>
					) : dbTags?.length ? (
						<SelectTag />
					) : (
						<LinkButton className="p-2" to={"/app/tags?create_tag=1"}>
							create a tag
						</LinkButton>
					)}
				</div>

				{isRunning ? (
					<Button onPress={() => stopTimer()} className="px-[4rem] py-4">
						stop
					</Button>
				) : (
					<Button onPress={() => startTimer()} className="px-[4rem] py-4">
						start
					</Button>
				)}
			</div>
		</WithAnimation>
	);
}

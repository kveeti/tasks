import { PlayIcon, StopIcon } from "@radix-ui/react-icons";
import { useMutation } from "@tanstack/react-query";
import addSeconds from "date-fns/addSeconds";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";

import { Button2, Button3 } from "@/Ui/Button";
import { Link } from "@/Ui/Link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Ui/Select";
import { type DbTask, db } from "@/db/db";
import { apiRequest } from "@/utils/api/apiRequest";
import type { ApiTask } from "@/utils/api/types";
import { createId } from "@/utils/createId";
import { getMinutesAndSeconds } from "@/utils/formatSeconds";

import { useTimerContext } from "./TimerContext";
import { WithAnimation } from "./WithAnimation";

export function AppPage() {
	const { selectedTagTime } = useTimerContext();

	return (
		<WithAnimation>
			<div className="flex h-full w-full flex-col items-center justify-center gap-10">
				<div className="flex w-full flex-col items-center justify-center gap-10 pt-16 not-mobile:pt-0">
					{selectedTagTime ? <TaskRunning /> : <TaskNotRunning />}
				</div>
			</div>
		</WithAnimation>
	);
}

function TaskRunning() {
	const { selectedTagTime, activeTasks, setSelectedTagId, selectedTagId } = useTimerContext();
	const editTaskMutation = useEditTaskMutation();

	const tags = activeTasks?.map((t) => t.tag);

	function stopTimer() {
		if (!selectedTagTime) return;

		const stoppedAt = new Date();

		Promise.all([
			db.tasks.update(selectedTagTime.id, { stopped_at: stoppedAt }),
			editTaskMutation.mutateAsync({
				task_id: selectedTagTime.id,
				body: { stopped_at: stoppedAt.toISOString() },
			}),
		]);
	}

	return (
		<>
			<h2 className="tabular-nums">
				<span>{selectedTagTime?.timeUntilExpiry.minutes}</span>
				<span>:</span>
				<span>{selectedTagTime?.timeUntilExpiry.seconds}</span>
			</h2>

			<div>
				<Select value={selectedTagId} onValueChange={setSelectedTagId}>
					<SelectTrigger>
						<SelectValue placeholder="Select a tag" />
					</SelectTrigger>
					<SelectContent>
						{tags?.map((tag) => (
							<SelectItem key={tag.id} value={tag.id}>
								{tag.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="w-full">
				<Button3
					className="flex h-full grow items-start justify-center p-4"
					onPress={stopTimer}
				>
					<StopIcon className="h-6 w-6" />
				</Button3>
			</div>
		</>
	);
}

function TaskNotRunning() {
	const [time, setTime] = useState(0);
	const [selectedTagId, setSelectedTagId] = useState<string>();

	const addTaskMutation = useAddTaskMutation();

	const tags = useLiveQuery(() => db.tags.toArray());

	const { minutes, seconds } = getMinutesAndSeconds(time);

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
		if (!selectedTagId) return;

		const selectedTag = tags?.find((tag) => tag.id === selectedTagId);
		if (!selectedTag) return;

		const expires_at = addSeconds(new Date(), time);

		const task = {
			id: createId(),
			tag_id: selectedTag.id,
			created_at: new Date(),
			updated_at: new Date(),
			expires_at,
			stopped_at: null,
		};

		await Promise.all([db.tasks.add(task), addTaskMutation.mutateAsync(task)]);
	}

	return (
		<>
			<h2 className="text-[6rem] font-semibold leading-[1]">
				<span>{minutes}</span>
				<span>:</span>
				<span>{seconds}</span>
			</h2>

			<div className="flex w-full max-w-[16rem] gap-1.5">
				<div className="flex w-full flex-col gap-1.5 rounded-2xl border-2 border-gray-800/80 p-1.5">
					<Button2 className="py-2 " onPress={() => addTime(1800)}>
						+ 30 min
					</Button2>
					<Button2 className="py-2 " onPress={() => subtractTime(1800)}>
						- 30 min
					</Button2>
				</div>

				<div className="flex w-full flex-col gap-1.5 rounded-2xl border-2 border-gray-800/80 p-1.5">
					<Button2 className="py-2 " onPress={() => addTime(300)}>
						+ 5 min
					</Button2>
					<Button2 className="py-2 " onPress={() => subtractTime(300)}>
						- 5 min
					</Button2>
				</div>
			</div>

			<div className="flex">
				{tags?.length ? (
					<Select value={selectedTagId} onValueChange={setSelectedTagId}>
						<SelectTrigger>
							<SelectValue placeholder="Select a tag" />
						</SelectTrigger>
						<SelectContent>
							{tags?.map((tag) => (
								<SelectItem key={tag.id} value={tag.id}>
									{tag.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				) : (
					<Link className="px-3 py-2" href="/app/tags">
						Create tag
					</Link>
				)}
			</div>

			<div className="w-full max-w-[16rem]">
				<Button3
					className="flex h-full grow items-start justify-center p-4"
					onPress={() => {
						startTimer();
					}}
				>
					<PlayIcon className="h-6 w-6" />
				</Button3>
			</div>
		</>
	);
}

function useAddTaskMutation() {
	return useMutation((body: DbTask) =>
		apiRequest<void>({
			method: "POST",
			path: "/tasks",
			body,
		})
	);
}

function useEditTaskMutation() {
	return useMutation((props: { task_id: string; body: Partial<ApiTask> }) =>
		apiRequest<void>({
			method: "PATCH",
			path: `/tasks/${props.task_id}`,
			body: props.body,
		})
	);
}

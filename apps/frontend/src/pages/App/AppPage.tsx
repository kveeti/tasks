import { PlayIcon, StopIcon } from "@radix-ui/react-icons";
import addSeconds from "date-fns/addSeconds";
import differenceInMilliseconds from "date-fns/differenceInMilliseconds";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";

import { createId } from "@tasks/shared";

import { Button2, Button3 } from "@/Ui/Button";
import { Link } from "@/Ui/Link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Ui/Select";
import { trpc } from "@/api";
import { useUserId } from "@/auth";
import { db } from "@/db/db";
import { getMinutesAndSeconds } from "@/utils/formatSeconds";

import { useTimerContext } from "./TimerContext";
import { WithAnimation } from "./WithAnimation";

export function AppPage() {
	const { selectedTagTime } = useTimerContext();

	return (
		<WithAnimation>
			<div className="flex h-full w-full flex-col items-center justify-center gap-10 p-10">
				<div className="flex flex-col items-center justify-center gap-10">
					{selectedTagTime ? <TaskRunning /> : <TaskNotRunning />}
				</div>
			</div>
		</WithAnimation>
	);
}

function TaskRunning() {
	const { selectedTagTime, activeTasks, setSelectedTagId, selectedTagId } = useTimerContext();

	const tags = activeTasks?.map((t) => t.tag);

	function stopTimer() {
		if (!selectedTagTime) return;
		db.tasks.update(selectedTagTime.id, { stoppedAt: new Date() });
	}

	return (
		<>
			<span className="line bg-gray-1000 flex w-full justify-center rounded-xl border-2 border-b-4 border-gray-800 px-3 py-4 text-[4.4rem] font-semibold leading-[1] transition-all duration-200">
				<h2 className="tabular-nums">
					<span>{selectedTagTime?.timeUntilExpiry.minutes}</span>
					<span>:</span>
					<span>{selectedTagTime?.timeUntilExpiry.seconds}</span>
				</h2>
			</span>

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
	const [time, setTime] = useState(0); // seconds
	const [selectedTagId, setSelectedTagId] = useState<string>();

	const addNotifMutation = trpc.notifs.addNotif.useMutation();

	const userId = useUserId();

	const tags = useLiveQuery(() => db.tags.filter((tag) => tag.userId === userId).toArray());

	const { minutes, seconds } = getMinutesAndSeconds(time);

	function addTime(seconds: number) {
		setTime(5);
		//setTime(time + seconds);
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

		const expiresAt = addSeconds(new Date(), time);

		await db.tasks.add({
			id: createId(),
			tag: selectedTag,
			userId,
			createdAt: new Date(),
			expiresAt,
			stoppedAt: null,
		});

		const notif = {
			id: createId(),
			title: "Timer expired",
			message: `Timer for ${selectedTag.label} expired after ${minutes}:${seconds}`,
			sendAt: expiresAt,
			userId,
			createdAt: new Date(),
		};

		await db.notifs.add(notif);

		await addNotifMutation.mutateAsync(notif);

		navigator.serviceWorker.ready.then((registration) => {
			registration.active?.postMessage(
				JSON.stringify({
					type: "START_TIMER",
					payload: {
						title: notif.title,
						message: notif.message,
						sendAfter: differenceInMilliseconds(notif.sendAt, new Date()),
					},
				})
			);
		});
	}

	return (
		<>
			<span className="line bg-gray-1000 flex w-full justify-center rounded-xl border-2 border-b-4 border-gray-800 px-3 py-4 text-[4.4rem] font-semibold leading-[1] transition-all duration-200">
				<h2 className="tabular-nums">
					<span>{minutes}</span>
					<span>:</span>
					<span>{seconds}</span>
				</h2>
			</span>

			<div className="flex w-full gap-1.5">
				<div className="flex w-full flex-col gap-1.5 rounded-2xl border-2 border-gray-800/80 p-1.5">
					<Button2 className="py-2 text-sm" onPress={() => addTime(1800)}>
						+ 30 min
					</Button2>
					<Button2 className="py-2 text-sm" onPress={() => subtractTime(1800)}>
						- 30 min
					</Button2>
				</div>

				<div className="flex w-full flex-col gap-1.5 rounded-2xl border-2 border-gray-800/80 p-1.5">
					<Button2 className="py-2 text-sm" onPress={() => addTime(300)}>
						+ 5 min
					</Button2>
					<Button2 className="py-2 text-sm" onPress={() => subtractTime(300)}>
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
					<Link className="px-3 py-2 text-sm" href="/app/tags">
						Create tag
					</Link>
				)}
			</div>

			<div className="w-full">
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
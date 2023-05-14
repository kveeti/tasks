import { PlayIcon, StopIcon } from "@radix-ui/react-icons";
import { Button2, Button3 } from "../../Ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Ui/Select";
import { db } from "../../db/db";
import { useTimerContext } from "./TimerContext";
import { useState } from "react";
import { getMinutesAndSeconds } from "../../utils/formatSeconds";
import { uuid } from "../../utils/uuid";
import addSeconds from "date-fns/addSeconds";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "../../Ui/Link";
import { useUserId } from "../../auth";

export function AppPage() {
	const { selectedTagTime } = useTimerContext();

	return (
		<div className="flex flex-col p-10 items-center justify-center w-full h-full gap-10">
			<div className="flex flex-col items-center justify-center gap-10">
				{selectedTagTime ? <TaskRunning /> : <TaskNotRunning />}
			</div>
		</div>
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
			<span className="transition-all duration-200 w-full justify-center flex text-[4.4rem] leading-[1] line font-semibold border-2 border-gray-800 border-b-4 bg-gray-1000 py-4 px-3 rounded-xl">
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
					className="grow h-full p-4 flex items-start justify-center"
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

	const userId = useUserId();

	const tags = useLiveQuery(() => db.tags.filter((tag) => tag.userId === userId).toArray());

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

	function startTimer() {
		if (!selectedTagId) return;

		const selectedTag = tags?.find((tag) => tag.id === selectedTagId);
		if (!selectedTag) return;

		db.tasks.add({
			id: uuid(),
			tag: selectedTag,
			userId,
			createdAt: new Date(),
			expiresAt: addSeconds(new Date(), time),
			stoppedAt: null,
		});
	}

	return (
		<>
			<span className="transition-all duration-200 w-full justify-center flex text-[4.4rem] leading-[1] line font-semibold border-2 border-gray-800 border-b-4 bg-gray-1000 py-4 px-3 rounded-xl">
				<h2 className="tabular-nums">
					<span>{minutes}</span>
					<span>:</span>
					<span>{seconds}</span>
				</h2>
			</span>

			<div className="flex gap-1.5 w-full">
				<div className="flex w-full flex-col gap-1.5 border-2 border-gray-800/80 rounded-2xl p-1.5">
					<Button2 className="py-2 text-sm" onPress={() => addTime(1800)}>
						+ 30 min
					</Button2>
					<Button2 className="py-2 text-sm" onPress={() => subtractTime(1800)}>
						- 30 min
					</Button2>
				</div>

				<div className="flex w-full flex-col gap-1.5 border-2 border-gray-800/80 rounded-2xl p-1.5">
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
					<Link className="py-2 px-3 text-sm" href="/app/tags">
						Create tag
					</Link>
				)}
			</div>

			<div className="w-full">
				<Button3
					className="grow h-full p-4 flex items-start justify-center"
					onPress={() => startTimer()}
				>
					<PlayIcon className="h-6 w-6" />
				</Button3>
			</div>
		</>
	);
}

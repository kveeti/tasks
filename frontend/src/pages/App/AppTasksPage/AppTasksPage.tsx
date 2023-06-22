import { zodResolver } from "@hookform/resolvers/zod";
import { useButton } from "@react-aria/button";
import { FocusRing } from "@react-aria/focus";
import type { AriaButtonProps } from "@react-types/button";
import addDays from "date-fns/addDays";
import addHours from "date-fns/addHours";
import format from "date-fns/format";
import isSameDay from "date-fns/isSameDay";
import isToday from "date-fns/isToday";
import isTomorrow from "date-fns/isTomorrow";
import isYesterday from "date-fns/isYesterday";
import startOfDay from "date-fns/startOfDay";
import subDays from "date-fns/subDays";
import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, motion, useAnimate, useAnimation, useIsPresent } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronsUpDown, Plus } from "lucide-react";
import { type ComponentProps, useEffect, useRef, useState } from "react";
import colors from "tailwindcss/colors";
import { z } from "zod";

import { Input } from "@/Ui/Input";
import { Label } from "@/Ui/Label";
import { Modal } from "@/Ui/Modal";
import { Button, SelectButton } from "@/Ui/NewButton";
import { type DbTask, addNotSynced, db } from "@/db/db";
import { useDbTags } from "@/db/useCommonDb";
import { cn } from "@/utils/classNames";
import { createId } from "@/utils/createId";
import { sleep } from "@/utils/sleep";
import { useForm } from "@/utils/useForm";

import { useTimerContext } from "../TimerContext";
import { WithAnimation } from "../WithAnimation";

export function AppTasksPage() {
	const [createdTask, setCreatedTask] = useState<DbTask | null>(null);
	const [selectedDay, setSelectedDay] = useState(startOfDay(new Date()));
	const formattedSelectedDay = isToday(selectedDay)
		? "today"
		: isYesterday(selectedDay)
		? "yesterday"
		: isTomorrow(selectedDay)
		? "tomorrow"
		: format(selectedDay, "EEE, MMMM do");

	function scrollTimeFrame(direction: "left" | "right") {
		setSelectedDay((day) => {
			if (direction === "right") {
				return addDays(day, 1);
			} else {
				return subDays(day, 1);
			}
		});
	}

	const dbTags = useDbTags();
	const dbTasks = useLiveQuery(
		() =>
			db.tasks
				.orderBy("created_at")
				.filter((t) => !t.deleted_at && isSameDay(t.started_at, selectedDay))
				.reverse()
				.toArray(),
		[selectedDay]
	);

	const dbTasksWithTags = dbTasks?.map((task) => ({
		...task,
		tag: dbTags?.find((tag) => tag.id === task.tag_id),
	}));

	return (
		<WithAnimation>
			<div className="flex h-full w-full flex-col">
				<div className="flex items-center justify-between gap-4 px-4 pt-4">
					<h1 className="text-2xl font-bold">tasks</h1>

					<NewTask setCreatedTask={setCreatedTask} />
				</div>

				<div className="flex h-full flex-col overflow-auto p-4">
					<AnimatePresence initial={false}>
						{dbTasksWithTags?.map((task, i) => (
							<Task
								key={task.id}
								isCreatedTask={createdTask?.id === task.id}
								resetCreatedTask={() => setCreatedTask(null)}
								className={cn(i !== dbTasksWithTags.length && "mb-2")}
							>
								<div className="flex w-full items-center justify-between gap-3">
									<div className="flex items-center gap-3">
										<div
											className="h-3 w-3 rounded-full"
											style={{ backgroundColor: task.tag.color }}
										/>
										<span>{task.tag.label}</span>
									</div>
									<span className="text-gray-400">
										{format(task.started_at, "HH:mm")} -{" "}
										{format(task.stopped_at ?? task.expires_at, "HH:mm")}
									</span>
								</div>
							</Task>
						))}
					</AnimatePresence>
				</div>

				<div className="border-t border-t-gray-800 bg-gray-900 p-4">
					<div className="flex w-full justify-between gap-4">
						<Button className="p-2" onPress={() => scrollTimeFrame("left")}>
							<ChevronLeft />
						</Button>

						<span className="flex w-full items-center justify-center rounded-xl bg-gray-600 px-4 py-2">
							{formattedSelectedDay}
						</span>

						<Button className="p-2" onPress={() => scrollTimeFrame("right")}>
							<ChevronRight />
						</Button>
					</div>
				</div>
			</div>
		</WithAnimation>
	);
}

function Task(
	props: ComponentProps<"button"> &
		AriaButtonProps & { isCreatedTask: boolean; resetCreatedTask: () => void }
) {
	const [ref, animate] = useAnimate();
	const [wrapperRef, wrapperAnimate] = useAnimate();
	const isPresent = useIsPresent();

	const aria = useButton(
		{
			...props,
			onPressStart: async () => {
				animate(ref.current, { backgroundColor: colors.neutral[800] }, { duration: 0 });
			},
			onPressEnd: async () => {
				animate(ref.current, {
					backgroundColor: "rgb(10 10 10 / 0.5)",
					transition: { duration: 0.4 },
				});
			},
			onPress: async (e) => {
				animate(ref.current, {
					backgroundColor: "rgb(10 10 10 / 0.5)",
					transition: { duration: 0.4 },
				});

				props.onPress?.(e);
			},
			// @ts-expect-error undocumented prop
			preventFocusOnPress: true,
		},
		ref
	);

	useEffect(() => {
		if (!isPresent || !props.isCreatedTask) return;

		(async () => {
			wrapperRef.current.style = "height: 0; opacity: 0;";
			ref.current.style = `background-color: ${colors.neutral[700]}`;

			await animate(wrapperRef.current, { height: "auto", opacity: 1 });
			animate(ref.current, {
				backgroundColor: "rgb(10 10 10 / 0.5)",
				transition: { duration: 0.4 },
			});

			props.resetCreatedTask();
		})();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isPresent]);

	return (
		<div ref={wrapperRef}>
			<FocusRing focusRingClass="outline-gray-300">
				<button
					{...aria.buttonProps}
					ref={ref}
					className={cn(
						"flex w-full cursor-default items-center gap-4 p-4 rounded-xl bg-gray-950/50 outline-none outline-2 outline-offset-2",
						props.className
					)}
				>
					{props.children}
				</button>
			</FocusRing>
		</div>
	);
}

const addTasksFormSchema = z.object({
	start: z.string().transform(Date),
	duration: z.number(),
	tagId: z.string(),
});

function NewTask(props: { setCreatedTask: (task: DbTask) => void }) {
	const [isOpen, setIsOpen] = useState(false);

	const newTaskForm = useForm<z.infer<typeof addTasksFormSchema>>({
		resolver: zodResolver(addTasksFormSchema),
		defaultValues: {
			start: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
			duration: 0,
			tagId: "",
		},
		onSubmit: async (values) => {
			const startDate = new Date(values.start);
			const endDate = addHours(startDate, values.duration);

			const newTask: DbTask = {
				id: createId(),
				tag_id: values.tagId,
				started_at: startDate,
				expires_at: endDate,
				stopped_at: null,
				deleted_at: null,
				updated_at: new Date(),
				created_at: new Date(),
			};

			await Promise.all([db.tasks.add(newTask), addNotSynced(newTask.id, "task")]);

			props.setCreatedTask(newTask);

			newTaskForm.reset();
			setIsOpen(false);
		},
	});

	return (
		<>
			<Button
				className="rounded-full p-2"
				onPress={async () => {
					// setIsOpen(true)
					const newTask: DbTask = {
						id: createId(),
						tag_id: "01H3H139RPYQ5049REEQEDEXKZ",
						started_at: new Date(),
						expires_at: addHours(new Date(), 1),
						stopped_at: null,
						deleted_at: null,
						updated_at: new Date(),
						created_at: new Date(),
					};

					await Promise.all([db.tasks.add(newTask), addNotSynced(newTask.id, "task")]);

					props.setCreatedTask(newTask);
				}}
			>
				<Plus className="h-4 w-4" />
			</Button>

			<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
				<div className="flex flex-col gap-4">
					<h1 className="text-2xl font-bold">new task</h1>

					<form onSubmit={newTaskForm.handleSubmit} className="flex flex-col gap-4">
						<Input
							type="datetime-local"
							label="start"
							required
							{...newTaskForm.register("start")}
						/>

						<Input
							type="number"
							label="(h) duration"
							required
							{...newTaskForm.register("duration", { valueAsNumber: true })}
						/>

						<div className="flex flex-col gap-1">
							<Label id="select-tag" required>
								tag
							</Label>

							<NewTaskSelectTag
								selectedTagId={newTaskForm.watch("tagId")}
								onSelect={(tagId) => newTaskForm.setValue("tagId", tagId)}
							/>
						</div>

						<div className="flex w-full gap-3 pt-2">
							<Button
								onPress={() => setIsOpen(false)}
								className="flex-1 p-4"
								isSecondary
							>
								cancel
							</Button>
							<Button className="flex-1 p-4" type="submit">
								add
							</Button>
						</div>
					</form>
				</div>
			</Modal>
		</>
	);
}

function NewTaskSelectTag(props: { selectedTagId: string; onSelect: (id: string) => void }) {
	const [isOpen, setIsOpen] = useState(false);
	const { dbTags } = useTimerContext();

	const selectedTag = dbTags?.find((tag) => tag.id === props.selectedTagId);

	return (
		<>
			<SelectButton onPress={() => setIsOpen(true)}>
				{selectedTag ? (
					<div className="flex items-center gap-3">
						<div
							className="h-3 w-3 rounded-full"
							style={{ backgroundColor: selectedTag.color }}
						/>

						<span>{selectedTag.label}</span>
					</div>
				) : (
					"select a tag"
				)}

				<ChevronsUpDown className="h-4 w-4 text-gray-200" />
			</SelectButton>

			<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
				<div className="flex flex-col gap-4">
					<h1 className="text-2xl font-bold">select a tag</h1>

					<div className="flex w-full flex-col gap-2">
						{dbTags?.map((tag) => (
							<Tag
								key={tag.id}
								onPress={() => {
									props.onSelect(tag.id);
									setIsOpen(false);
								}}
							>
								<div
									className="h-3 w-3 rounded-full"
									style={{ backgroundColor: tag.color }}
								/>

								{tag.label}
							</Tag>
						))}
					</div>
				</div>
			</Modal>
		</>
	);
}

function Tag(props: ComponentProps<"button"> & AriaButtonProps) {
	const ref = useRef<HTMLButtonElement | null>(null);
	const controls = useAnimation();

	const aria = useButton(
		{
			...props,
			onPress: async (e) => {
				controls.set({ backgroundColor: colors.neutral[800] });

				controls.start({
					backgroundColor: "rgb(10 10 10 / 0.5)",
					transition: { duration: 0.3 },
				});

				await sleep(200);

				props.onPress?.(e);
			},
			// @ts-expect-error undocumented prop
			preventFocusOnPress: true,
		},
		ref
	);

	return (
		<FocusRing focusRingClass="outline-gray-300">
			{/* @ts-expect-error dont know how to fix this */}
			<motion.button
				{...aria.buttonProps}
				ref={ref}
				animate={controls}
				className={cn(
					"flex w-full cursor-default items-center gap-4 rounded-xl bg-gray-950/50 p-4 outline-none outline-2 outline-offset-2",
					props.className
				)}
			>
				{props.children}
			</motion.button>
		</FocusRing>
	);
}
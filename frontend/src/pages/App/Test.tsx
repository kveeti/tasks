import { type AriaButtonProps, useButton } from "@react-aria/button";
import { FocusRing } from "@react-aria/focus";
import { useLink } from "@react-aria/link";
import { useMutation } from "@tanstack/react-query";
import addSeconds from "date-fns/addSeconds";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { type ComponentProps, type ReactNode, useRef, useState } from "react";
import { Outlet, Link as RRDLink, useLocation } from "react-router-dom";
import { Minus, Plus } from "tabler-icons-react";

import { Modal } from "@/Ui/Modal";
import { Button } from "@/Ui/NewButton";
import { type DbTask, db } from "@/db/db";
import { apiRequest } from "@/utils/api/apiRequest";
import { cn } from "@/utils/classNames";
import { createId } from "@/utils/createId";
import { getMinutesAndSeconds } from "@/utils/formatSeconds";

import { TimerContextProvider, useTimerContext } from "./TimerContext";
import { WithAnimation } from "./WithAnimation";

const links = [
	{ id: "home", label: "Home", href: "/app" },
	{ id: "stats", label: "Stats", href: "/app/stats" },
	{ id: "tags", label: "Tags", href: "/app/tags" },
	{ id: "settings", label: "Settings", href: "/app/settings" },
];

export function Test() {
	return (
		<TimerContextProvider>
			<TestInner />
		</TimerContextProvider>
	);
}

function TestInner() {
	const location = useLocation();
	const activeLinkId = links.find((link) => link.href === location.pathname)?.id;

	return (
		<div className="fixed h-full w-full overflow-auto">
			<div className="flex h-full w-full flex-col items-center justify-center gap-2 p-1">
				<div className="flex w-full max-w-[400px] items-center justify-between rounded-full border border-gray-700 bg-gray-900 p-2">
					<h1 className="pl-2 text-lg font-bold">Tasks</h1>
					<div className="flex items-center justify-center gap-2 rounded-full">
						username
						<div className="rounded-full border border-gray-50/20 bg-gray-400/70 px-4 py-2">
							u
						</div>
					</div>
				</div>

				<div className="h-full max-h-[500px] w-full max-w-[400px] rounded-[30px] border border-gray-700 bg-gray-900">
					<AnimatePresence>
						<Outlet />
					</AnimatePresence>
				</div>

				<div className="flex w-full max-w-[320px] rounded-[30px] border border-gray-700 bg-gray-900 p-2">
					{links.map((l) => (
						<RRDLink
							key={l.id}
							to={l.href}
							className="relative flex w-full items-center justify-center rounded-full px-4 py-2"
						>
							{activeLinkId === l.id && (
								<motion.div
									layoutId="active-indicator"
									className="absolute inset-0 w-full rounded-full border border-gray-50/10 bg-gray-50/20"
									transition={{
										duration: 0.1,
										type: "spring",
										mass: 0.1,
									}}
								/>
							)}
							<span className="relative">{l.label}</span>
						</RRDLink>
					))}
				</div>
			</div>
		</div>
	);
}

export function Index() {
	const addTaskMutation = useAddTaskMutation();

	const { selectedTagTime, selectedTag, dbTags } = useTimerContext();

	const [time, setTime] = useState(0);
	const { minutes, seconds } = getMinutesAndSeconds(time);

	const isRunning = !!selectedTagTime;
	const isStartingDisabled = isRunning || time <= 0;

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
		<WithAnimation>
			<div className="flex h-full w-full flex-col items-center justify-center gap-8">
				<h2 className="rounded-3xl border border-gray-50/20 bg-gray-950/40 p-4 text-[5.5rem] font-semibold leading-[1] text-gray-50">
					<span>{isRunning ? selectedTagTime?.timeUntilExpiry.minutes : minutes}</span>
					<span>:</span>
					<span>{isRunning ? selectedTagTime?.timeUntilExpiry.seconds : seconds}</span>
				</h2>

				<div className="flex w-full max-w-[260px] gap-2">
					<div className="flex w-full flex-col gap-2 rounded-2xl border border-gray-50/20 bg-gray-950/40 p-2">
						<Button className="w-full p-2" onPress={() => addTime(1800)}>
							<Plus strokeWidth={1.8} className="h-[16px] w-[16px]" />{" "}
							<span>30 min</span>
						</Button>
						<Button className="w-full p-2" onPress={() => subtractTime(1800)}>
							<Minus strokeWidth={1.8} className="h-[16px] w-[16px]" /> 30 min
						</Button>
					</div>

					<div className="flex w-full flex-col gap-2 rounded-2xl border border-gray-50/20 bg-gray-950/40 p-2">
						<Button className="w-full p-2" onPress={() => addTime(1800)}>
							<Plus strokeWidth={1.8} className="h-[16px] w-[16px]" /> 5 min
						</Button>
						<Button className="w-full p-2" onPress={() => subtractTime(1800)}>
							<Minus strokeWidth={1.8} className="h-[16px] w-[16px]" /> 5 min
						</Button>
					</div>
				</div>

				{!selectedTag && dbTags?.length ? (
					<SelectTag />
				) : isRunning ? null : (
					<Link className="p-2" to={"/app/tags"}>
						Create a tag
					</Link>
				)}

				<Button
					onPress={() => startTimer()}
					isDisabled={isStartingDisabled}
					className="px-[4rem] py-4"
				>
					Start
				</Button>
			</div>
		</WithAnimation>
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

function SelectTag() {
	const { selectedTag, setSelectedTagId, dbTags } = useTimerContext();
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<Button className="px-6 py-2" onPress={() => setIsOpen(true)}>
				{selectedTag ? selectedTag.label : "Select a tag"}
			</Button>

			<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
				<div className="flex flex-col gap-4">
					<h1 className="text-3xl font-bold">Select a tag</h1>

					<div className="flex w-full flex-col gap-2">
						{dbTags?.map((tag) => (
							<Tag
								key={tag.id}
								onPress={() => {
									setSelectedTagId(tag.id);
									setIsOpen(false);
								}}
							>
								{tag.label}
							</Tag>
						))}
					</div>
				</div>
			</Modal>
		</>
	);
}

const MotionRRDLink = motion(RRDLink);

function Link(props: { children: ReactNode; to: string; className?: string }) {
	const ref = useRef<HTMLLinkElement | null>(null);
	const controls = useAnimation();

	const aria = useLink(
		{
			onPressStart: () => {
				controls.stop();
				controls.set({
					backgroundColor: "rgb(209 213 219 / 0.6)",
					boxShadow:
						"rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px",
					y: 1,
				});
			},
			onPressEnd: () => {
				controls.start({
					backgroundColor: "rgb(156 163 175 / 0.5)",
					boxShadow: "rgba(0, 0, 0, 0.1) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px",
					y: 0,
				});
			},
			onPress: () => {
				ref.current?.focus();
				controls.start({
					backgroundColor: "rgb(156 163 175 / 0.5)",
					boxShadow: "rgba(0, 0, 0, 0.1) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px",
					y: 0,
				});
			},
			// @ts-expect-error undocumented prop
			preventFocusOnPress: true,
		},
		ref
	);

	return (
		<FocusRing>
			{/* @ts-expect-error dont know how to fix this */}
			<MotionRRDLink
				{...aria.linkProps}
				to={props.to}
				ref={ref}
				animate={controls}
				transition={{ duration: 0.2 }}
				className={cn(
					"flex cursor-default select-none items-center justify-center gap-2 rounded-xl bg-gray-400/50 px-4 shadow-up outline-none outline-2 outline-offset-2 transition-[outline,opacity] duration-200 disabled:opacity-40 disabled:shadow-none",
					props.className
				)}
			>
				{props.children}
			</MotionRRDLink>
		</FocusRing>
	);
}

function Tag(props: ComponentProps<"button"> & AriaButtonProps) {
	const ref = useRef<HTMLButtonElement | null>(null);
	const controls = useAnimation();

	const aria = useButton(
		{
			...props,
			onPress: async (e) => {
				await controls.start({
					backgroundColor: "rgb(55 65 81 / 0.5)",
					transition: { duration: 0.04 },
				});

				await new Promise((resolve) => setTimeout(resolve, 25));

				await controls.start({
					backgroundColor: "rgb(17 24 39 / 0.5)",
					transition: { duration: 0.02 },
				});
				await new Promise((resolve) => setTimeout(resolve, 100));

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
				transition={{ duration: 0.3 }}
				className={cn(
					"w-full rounded-xl bg-gray-900/50 p-4 outline-none outline-2 outline-offset-2",
					props.className
				)}
			>
				{props.children}
			</motion.button>
		</FocusRing>
	);
}

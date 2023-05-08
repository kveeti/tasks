import { AnimatePresence, motion } from "framer-motion";
import { Fragment, ReactNode } from "react";

import { SkeletonButton } from "~ui/Button";

import { CreateTag } from "../../_shared/CreateTagModal/CreateTagModal";
import { SelectTag } from "./Tags/SelectTag";
import { ShowTag } from "./Tags/ShowTag";
import { SkeletonTime, Time } from "./Time";
import { SkeletonTimeButtons, TimeButtons } from "./TimeButtons";
import { useTimerContext } from "./TimerContext";
import { ToggleTimerButton } from "./ToggleTimerButton";

export const Timer = () => {
	const { error, isLoading, tags, isRunning } = useTimerContext();

	if (isLoading) return <SkeletonTimer />;
	if (error) return <div>Error</div>;

	return (
		<div className="mx-auto flex w-full flex-col items-center justify-center">
			<AnimatePresence initial={false}>
				<Time key="time" />

				{!isRunning && (
					<AnimatedItem className="w-full" key="time-btns">
						<TimeButtons />
					</AnimatedItem>
				)}

				<Fragment key="tags">
					{isRunning ? (
						<ShowTag key="show-tag" />
					) : tags?.length ? (
						<SelectTag key="select-tag" />
					) : (
						<CreateTag key="create-tag" btnClassName="mt-7" />
					)}
				</Fragment>

				<ToggleTimerButton key="toggle-timer-button" />
			</AnimatePresence>
		</div>
	);
};

const SkeletonTimer = () => {
	return (
		<div className="mx-auto flex w-full animate-pulse flex-col items-center justify-center gap-7">
			<SkeletonTime />

			<SkeletonTimeButtons />

			<SkeletonButton className="w-[5rem]" />

			<SkeletonButton className="w-full py-5" />
		</div>
	);
};

type AnimatedItemProps = {
	children: ReactNode;
	className?: string;
};

const AnimatedItem = ({ children, className }: AnimatedItemProps) => {
	return (
		<motion.div
			className={className}
			initial={{ height: 0, opacity: 0 }}
			animate={{ height: "auto", opacity: 1 }}
			exit={{ height: 0, opacity: 0 }}
			transition={{ duration: 0.4, ease: "easeInOut" }}
		>
			<div className="pt-7" />

			{children}
		</motion.div>
	);
};

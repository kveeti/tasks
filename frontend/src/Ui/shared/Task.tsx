import { useButton } from "@react-aria/button";
import { FocusRing } from "@react-aria/focus";
import format from "date-fns/format";
import { useAnimate, useIsPresent } from "framer-motion";
import { useEffect } from "react";
import { twMerge } from "tailwind-merge";
import colors from "tailwindcss/colors";

import type { DbTag, DbTask } from "@/db/db";
import { cn } from "@/utils/classNames";

export function Task(props: {
	task: DbTask & { tag: DbTag };
	onPress?: () => void;
	isCreatedTask: boolean;
	resetCreatedTask: () => void;
	className?: string;
}) {
	const [ref, animate] = useAnimate();
	const [wrapperRef] = useAnimate();
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
			onPress: async () => {
				animate(ref.current, {
					backgroundColor: "rgb(10 10 10 / 0.5)",
					transition: { duration: 0.4 },
				});

				props.onPress?.();
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
					className={twMerge(
						"flex w-full cursor-default items-center gap-4 p-4 rounded-xl bg-gray-950/50 outline-none outline-2 outline-offset-2",
						props.className
					)}
				>
					<div className="flex w-full items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<div
								className="h-3 w-3 rounded-full"
								style={{ backgroundColor: props.task.tag.color }}
							/>
							<span>{props.task.tag.label}</span>
						</div>
						<span className="text-gray-400">
							{format(props.task.started_at, "HH:mm")} -{" "}
							{format(props.task.stopped_at ?? props.task.expires_at, "HH:mm")}
						</span>
					</div>
				</button>
			</FocusRing>
		</div>
	);
}

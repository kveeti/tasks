import { useButton } from "@react-aria/button";
import { FocusRing } from "@react-aria/focus";
import { useAnimate, useIsPresent } from "framer-motion";
import { useEffect } from "react";
import colors from "tailwindcss/colors";

import type { DbTag } from "@/db/db";

export function Tag(props: {
	tag: DbTag;
	onPress?: () => void;
	isCreatedTag?: boolean;
	resetCreatedTag?: () => void;
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
		if (!isPresent || !props.isCreatedTag) return;

		(async () => {
			wrapperRef.current.style = "height: 0; opacity: 0;";
			ref.current.style = `background-color: ${colors.neutral[700]}`;

			await animate(wrapperRef.current, { height: "auto", opacity: 1 });
			animate(ref.current, {
				backgroundColor: "rgb(10 10 10 / 0.5)",
				transition: { duration: 0.4 },
			});

			props.resetCreatedTag?.();
		})();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isPresent]);

	return (
		<div ref={wrapperRef}>
			<FocusRing focusRingClass="outline-gray-300">
				<button
					{...aria.buttonProps}
					ref={ref}
					className={
						"flex w-full cursor-default items-center gap-4 p-4 rounded-xl bg-gray-950/50 outline-none outline-2 outline-offset-2"
					}
				>
					<div
						className="h-3 w-3 rounded-full"
						style={{ backgroundColor: props.tag.color }}
					/>

					{props.tag.label}
				</button>
			</FocusRing>
		</div>
	);
}

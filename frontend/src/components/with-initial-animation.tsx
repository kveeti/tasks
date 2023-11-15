import { type MotionProps, motion, useAnimationControls, usePresence } from "framer-motion";
import { forwardRef, useEffect } from "react";

import { useIsMounted } from "@/utils/use-is-mounted";

export const WithEnterExitAnimation = forwardRef<
	HTMLDivElement,
	React.ComponentPropsWithoutRef<"div"> & MotionProps
>(({ children, ...props }, ref) => {
	const [isPresent, safeToRemove] = usePresence();
	const isMounted = useIsMounted();

	const controls = useAnimationControls();

	useEffect(() => {
		if (!isMounted) return;

		(async () => {
			if (isPresent) {
				await controls.start({
					height: "auto",
					opacity: 1,
					transition: { duration: 0.3 },
				});

				await controls.start({
					backgroundColor: "rgba(0, 0, 0, 0)",
					transition: { duration: 1.4 },
				});
			}

			if (!isPresent) {
				await controls.start({
					backgroundColor: "hsl(0, 62.8%, 30.6%)",
					transition: { duration: 0.2 },
				});
				await controls.start({
					height: 0,
					opacity: 0,
					transition: { duration: 0.3, delay: 0.2 },
				});

				safeToRemove();
			}
		})();
	}, [controls, isMounted, isPresent, safeToRemove]);

	return (
		<motion.div
			initial={{ height: 0, opacity: 0, backgroundColor: "rgba(50, 50, 50, 1)" }}
			animate={controls}
			className="overflow-hidden"
			{...props}
			ref={ref}
		>
			{children}
		</motion.div>
	);
});

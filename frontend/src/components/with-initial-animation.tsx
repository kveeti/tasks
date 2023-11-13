import { motion, useAnimationControls, usePresence } from "framer-motion";
import { useEffect, useRef } from "react";

export function WithInitialAnimation({ children }: { children: React.ReactNode }) {
	const [isPresent, safeToRemove] = usePresence();

	const controls = useAnimationControls();
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
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
	}, [controls, isPresent, safeToRemove]);

	return (
		<motion.div
			ref={ref}
			initial={{ height: 0, opacity: 0, backgroundColor: "rgba(50, 50, 50, 1)" }}
			animate={controls}
			className="overflow-hidden"
		>
			{children}
		</motion.div>
	);
}

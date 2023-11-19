import { type MotionProps, motion } from "framer-motion";
import { forwardRef } from "react";

export const WithEnterExitAnimation = forwardRef<
	HTMLDivElement,
	React.ComponentPropsWithoutRef<"div"> & MotionProps
>(({ children, ...props }, ref) => {
	return (
		<motion.div
			initial={{
				height: 0,
				opacity: 0,
				backgroundColor: "rgba(60, 60, 60, 1)",
			}}
			animate={{
				height: "auto",
				opacity: 1,
				backgroundColor: "rgba(0, 0, 0, 0)",
				transition: {
					backgroundColor: {
						duration: 1.8,
					},
					height: {
						duration: 0.3,
					},
				},
			}}
			exit={{
				height: 0,
				opacity: 0,
				backgroundColor: "hsl(0, 62.8%, 30.6%)",
				transition: {
					backgroundColor: {
						duration: 0.2,
					},
					opacity: {
						duration: 0.3,
						delay: 0.45,
					},
					height: {
						duration: 0.3,
						delay: 0.45,
					},
				},
			}}
			className="overflow-hidden"
			{...props}
			ref={ref}
		>
			{children}
		</motion.div>
	);
});

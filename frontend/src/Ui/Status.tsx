import { motion } from "framer-motion";

export function Loader() {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.2, ease: "easeInOut" }}
			className="box-border h-6 w-6 animate-spin-slow rounded-full border-2 border-gray-400 border-r-gray-600"
		/>
	);
}

export function Checkmark() {
	return (
		<div className="relative flex items-center justify-center">
			<svg
				className="h-6 w-6 text-white"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth={2}
			>
				<motion.path
					initial={{ pathLength: 0 }}
					animate={{
						pathLength: 1,
					}}
					transition={{
						duration: 0.5,
						delay: 0.25,
						type: "tween",
						ease: "easeOut",
					}}
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M5 13l4 4L19 7"
				/>
			</svg>
		</div>
	);
}

export function CheckmarkGreen() {
	return (
		<motion.div
			initial={{ scale: 0.5, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			transition={{ duration: 0.2, ease: "easeInOut" }}
			className="relative flex h-8 w-8 items-center justify-center rounded-full bg-green-600 shadow"
		>
			<div className="relative flex items-center justify-center">
				<svg
					className="h-5 w-5 text-white"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2}
				>
					<motion.path
						initial={{ pathLength: 0 }}
						animate={{
							pathLength: 1,
						}}
						transition={{
							duration: 0.5,
							delay: 0.25,
							type: "tween",
							ease: "easeOut",
						}}
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M5 13l4 4L19 7"
					/>
				</svg>
			</div>
		</motion.div>
	);
}

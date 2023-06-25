import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { useSyncing } from "@/utils/Syncing";
import { sleep } from "@/utils/sleep";

export function SyncStep(props: { isActive: boolean; nextStep: () => void }) {
	const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
	const { sync } = useSyncing();

	useEffect(() => {
		if (!props.isActive) return;

		const timeouts: number[] = [];

		(async () => {
			await sleep(100);

			setStatus("loading");

			const [, res] = await Promise.allSettled([sleep(2000), sync()]);

			if (!res || res?.status === "rejected") {
				setStatus("error");
				return;
			}

			setStatus("success");

			timeouts.push(
				setTimeout(() => {
					props.nextStep();
				}, 1000)
			);
		})();

		return () => {
			timeouts.forEach(clearTimeout);
		};
	}, [props]);

	return (
		<div className="gap-4 flex items-center">
			<AnimatePresence initial={false} mode="wait">
				{status === "loading" ? (
					<motion.div
						key="loader"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2, ease: "easeInOut" }}
						className="box-border h-8 w-8 animate-spin-slow rounded-full border-2 border-gray-400 border-r-gray-600"
					/>
				) : status === "error" ? (
					<motion.div
						key="error"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2, ease: "easeInOut" }}
					>
						<X />
					</motion.div>
				) : status === "success" ? (
					<Checkmark />
				) : (
					<motion.div
						key="idle"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2, ease: "easeInOut" }}
						className="h-8 w-8 rounded-full border border-gray-800"
					/>
				)}
			</AnimatePresence>

			<span>
				{status === "loading"
					? "Syncing..."
					: status === "error"
					? "Failed to sync"
					: status === "success"
					? "Synced!"
					: "Sync"}
			</span>
		</div>
	);
}

function Checkmark() {
	return (
		<motion.div
			key="checkmark"
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

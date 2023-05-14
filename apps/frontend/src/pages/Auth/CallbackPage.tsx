import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useMeasure from "react-use-measure";

import { trpc } from "../../api";
import { useUserIdContext } from "../../auth";

export function CallbackPage() {
	const firstRenderAtRef = useRef(new Date());
	const [status, setStatus] = useState<"loggingIn" | "failed" | "success">("loggingIn");
	const [searchParams] = useSearchParams();

	const code = searchParams.get("code");

	const { setUserId } = useUserIdContext();

	const verifyQuery = trpc.auth.verifyCode.useQuery({ code: code ?? "" }, { enabled: !!code });

	useEffect(() => {
		if (verifyQuery.isLoading) {
			return;
		}

		if (verifyQuery.isError) {
			setStatus("failed");
			return;
		}

		let timeouts: NodeJS.Timeout[] = [];

		if (verifyQuery.data) {
			const timeSinceFirstRender = new Date().getTime() - firstRenderAtRef.current.getTime();
			if (timeSinceFirstRender < 1000) {
				timeouts.push(
					setTimeout(() => {
						setStatus("success");
					}, 1000 - timeSinceFirstRender)
				);

				timeouts.push(
					setTimeout(() => {
						// Entrypoint.tsx will redirect to /app if userId is set
						setUserId(verifyQuery.data.id);
					}, 2000 - timeSinceFirstRender)
				);
			} else {
				setStatus("success");

				timeouts.push(
					setTimeout(() => {
						// Entrypoint.tsx will redirect to /app if userId is set
						setUserId(verifyQuery.data.id);
					}, 1000)
				);
			}

			return;
		}

		return () => {
			timeouts.forEach(clearTimeout);
		};
	}, [verifyQuery.status]);

	return (
		<Card>
			<div className="flex flex-col items-center justify-center gap-4 p-4">
				{status === "loggingIn" ? (
					<>
						<Loader />
						Logging in...
					</>
				) : status === "failed" ? (
					<>
						<Loader />
						failed
					</>
				) : status === "success" ? (
					<>
						<motion.div
							initial={{ scale: 0.5, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{
								duration: 0.7,
								ease: "easeInOut",
								type: "spring",
							}}
							className="relative flex h-16 w-16 items-center justify-center rounded-full bg-green-600 shadow"
						>
							<div className="relative flex items-center justify-center">
								<Checkmark />
							</div>
						</motion.div>
						Logged in!
					</>
				) : null}
			</div>
		</Card>
	);
}

function Card(props: { children: ReactNode; keey?: string }) {
	return (
		<div className="mx-auto w-full max-w-[300px] rounded-xl border border-gray-800 bg-gray-1000">
			<Resizeable>{props.children}</Resizeable>
		</div>
	);
}

function Resizeable(props: { children: ReactNode }) {
	const [ref, { height }] = useMeasure();

	return (
		<motion.div
			animate={{ height: height || "auto" }}
			transition={{ duration: 0.3, type: "tween" }}
			className="relative overflow-hidden"
		>
			<AnimatePresence initial={false}>
				<motion.div
					key={JSON.stringify(props.children, ignoreCircularReferences())}
					className={`${height ? "absolute" : "relative"} w-full`}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ delay: 0.2, duration: 0.4, type: "tween" }}
				>
					<div ref={ref} className="w-full">
						{props.children}
					</div>
				</motion.div>
			</AnimatePresence>
		</motion.div>
	);
}

function Loader() {
	return (
		<div className="animate-spin-slow box-border h-12 w-12 rounded-full border-2 border-gray-400 border-r-gray-600" />
	);
}

function Checkmark() {
	return (
		<svg
			className="h-12 w-12 text-white"
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
	);
}

function ignoreCircularReferences() {
	const seen = new WeakSet();
	return (key: any, value: any) => {
		if (key.startsWith("_")) return; // Don't compare React's internal props.
		if (typeof value === "object" && value !== null) {
			if (seen.has(value)) return;
			seen.add(value);
		}
		return value;
	};
}

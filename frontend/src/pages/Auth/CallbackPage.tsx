import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import useMeasure from "react-use-measure";

import { apiRequest } from "@/utils/api/apiRequest";

import { type User, useUserContext } from "../../auth";

export function CallbackPage() {
	const { setUser } = useUserContext();

	const [searchParams] = useSearchParams();
	const code = searchParams.get("code");

	const verifyQuery = useVerifyCodeQuery(code);

	useEffect(() => {
		if (verifyQuery.data) {
			setUser(verifyQuery.data);
		}
	}, [verifyQuery.status]);

	return null;
}

function useVerifyCodeQuery(code: string | null) {
	const isProd = import.meta.env.PROD;

	return useQuery(
		["verify-code"],
		() =>
			apiRequest<User>({
				method: "GET",
				...(isProd
					? {
							path: "/auth/google-verify-code",
							query: new URLSearchParams({ code: code! }),
					  }
					: {
							path: "/auth/dev-login",
					  }),
			}),
		isProd ? { enabled: !!code } : undefined
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

function Checkmark() {
	return (
		<motion.div
			initial={{ scale: 0.5, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			transition={{
				duration: 0.7,
				ease: "easeInOut",
			}}
			className="relative flex h-16 w-16 items-center justify-center rounded-full bg-green-600 shadow"
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

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useMeasure from "react-use-measure";

import { CheckmarkGreen } from "@/Ui/Status";
import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/utils/api/apiRequest";
import { useSetTimeout } from "@/utils/hooks/useSetInterval";

export function CallbackPage() {
	const [searchParams] = useSearchParams();
	const code = searchParams.get("code");
	const navigate = useNavigate();

	const mutation = useMutation({
		mutationKey: ["auth", "google-verify"],
		mutationFn: async ({ code }: { code: string }) => {
			const [res] = await Promise.allSettled([
				apiRequest({
					method: "POST",
					path: "/auth/google-verify",
					query: new URLSearchParams({ code }),
				}),
				new Promise((resolve) => setTimeout(resolve, 1000)),
			]);

			if (res.status === "rejected") {
				throw res.reason;
			}

			return res.value;
		},
	});

	const queryClient = useQueryClient();
	const [page, setPage] = useState<"logged-in" | "welcome">("logged-in");

	useSetTimeout(
		() => {
			setPage("welcome");
		},
		mutation.isSuccess ? 1600 : null
	);

	useSetTimeout(
		() => {
			if (mutation.data) {
				queryClient.setQueryData(["auth"], mutation.data);
			}
		},
		page === "welcome" ? 2000 : null
	);

	useSetTimeout(
		() => {
			navigate("/app");
		},
		mutation.isError ? 1000 : null
	);

	useEffect(() => {
		(async () => {
			if (code) {
				await mutation.mutateAsync({ code });

				return;
			}

			navigate("/auth/login");
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="flex flex-col items-center gap-10">
			<div className="bg-card border rounded-2xl min-w-[200px] w-full h-full justify-center">
				<Resizeable>
					{mutation.isError ? (
						<div className="flex flex-col gap-6 justify-center items-center w-full">
							<p>error logging in</p>
						</div>
					) : mutation.isSuccess ? (
						<div className="flex flex-col gap-6 justify-center items-center w-full">
							{page === "logged-in" ? (
								<>
									<CheckmarkGreen />

									<p>logged in</p>
								</>
							) : (
								<>
									<span className="text-5xl">👋</span>

									<p>welcome!</p>
								</>
							)}
						</div>
					) : (
						<div className="flex flex-col gap-6 justify-center items-center w-full">
							<Spinner />

							<p>logging in...</p>
						</div>
					)}
				</Resizeable>
			</div>
		</div>
	);
}

function Resizeable({ children }: { children: ReactNode }) {
	const [ref, { height }] = useMeasure();

	return (
		<motion.div
			animate={{ height: height || "auto" }}
			transition={{ duration: 0.5, ease: "easeInOut" }}
			className="relative overflow-hidden"
		>
			<AnimatePresence initial={false}>
				<motion.div
					key={JSON.stringify(children, ignoreCircularReferences())}
					initial={{
						x: 10,
						opacity: 0,
					}}
					animate={{
						x: 0,
						opacity: 1,
						transition: {
							opacity: { duration: 0.2 },
							x: { duration: 0.15 },
							delay: 0.15,
						},
					}}
					exit={{
						x: -10,
						opacity: 0,
						transition: {
							opacity: { duration: 0.2 },
							x: { duration: 0.15 },
						},
					}}
					className={cn(height ? "absolute" : "relative", "w-full")}
				>
					<div ref={ref} className="p-8">
						{children}
					</div>
				</motion.div>
			</AnimatePresence>
		</motion.div>
	);
}

function ignoreCircularReferences() {
	const seen = new WeakSet();
	return (key: string, value: unknown) => {
		if (key.startsWith("_")) return; // Don't compare React's internal props.
		if (typeof value === "object" && value !== null) {
			if (seen.has(value)) return;
			seen.add(value);
		}
		return value;
	};
}

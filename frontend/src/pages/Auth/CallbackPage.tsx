import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Fragment, type ReactNode, useEffect, useState } from "react";
import useMeasure from "react-use-measure";

import { apiRequest } from "@/utils/api/apiRequest";
import { cn } from "@/utils/classNames";

import { type User, useUserContext } from "../../auth";
import { LoginStep } from "./CallbackPage/LoginStep";
import { SyncStep } from "./CallbackPage/SyncStep";

const steps = [LoginStep, SyncStep];

export function CallbackPage() {
	const [activeStep, setActiveStep] = useState(-1);
	const [_user, _setUser] = useState<User | null>(null);

	const { setUser } = useUserContext();

	function nextStep() {
		setActiveStep((s) => s + 1);
	}

	useEffect(() => setActiveStep(0), []);

	useEffect(() => {
		const timeouts: number[] = [];

		if (activeStep > 2 && _user) {
			timeouts.push(
				setTimeout(() => {
					setUser(_user);
				}, 500)
			);
		}

		if (activeStep === 2) {
			timeouts.push(
				setTimeout(() => {
					setActiveStep(3);
				}, 2000)
			);
		}

		return () => {
			timeouts.forEach(clearTimeout);
		};
	}, [activeStep]);

	return (
		<div className="relative flex flex-col gap-2 mx-auto h-full w-full max-w-[250px]">
			<AnimatePresence initial={false} mode="wait">
				{activeStep < 2 ? (
					<motion.div
						key="steps"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="flex flex-col"
					>
						{steps.map((Comp, i) => (
							<Fragment key={i}>
								<div className="w-full p-4 relative">
									{activeStep === i && (
										<motion.div
											layoutId="active-step-indicator"
											className="absolute inset-0 w-full rounded-xl border border-gray-800 bg-gray-900"
											transition={{
												type: "spring",
												damping: 25,
											}}
										/>
									)}
									<div className="relative w-full">
										<Comp
											isActive={i === activeStep}
											setUser={_setUser}
											nextStep={nextStep}
										/>
									</div>
								</div>
								{i !== steps.length - 1 && (
									<Separator margin={activeStep === i + 1} />
								)}
							</Fragment>
						))}
					</motion.div>
				) : (
					<motion.div
						key="welcome"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="bg-gray-900 border flex-col gap-4 border-gray-800 flex items-center justify-center p-4 rounded-xl"
					>
						<span className="text-[4rem]">👋🏻</span>
						<span className="text-lg">Welcome!</span>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

function Separator(props: { margin?: boolean }) {
	return (
		<motion.div
			animate={{
				marginTop: props.margin ? "-0.5rem" : "0.5rem",
				marginBottom: props.margin ? "0.5rem" : "-0.5rem",
			}}
			transition={{ duration: 0.5, type: "tween" }}
			className={cn("p-4 ml-8 my-2 border-l border-l-gray-800")}
		/>
	);
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

function Card(props: { children: ReactNode; keey?: string }) {
	return (
		<div className="mx-auto w-full max-w-[300px] rounded-xl border border-gray-800 bg-gray-900">
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

// useEffect(() => {
// 	if (verifyQuery.status === "loading") {
// 		setSteps((steps) => {
// 			const newSteps = [...steps];
// 			const index = newSteps.findIndex((step) => step.id === "login");
// 			newSteps[index]!.status = "loading";

// 			return newSteps;
// 		});

// 		return;
// 	}

// 	if (verifyQuery.isError) {
// 		setSteps((steps) => {
// 			const newSteps = [...steps];
// 			const index = newSteps.findIndex((step) => step.id === "login");
// 			newSteps[index]!.status = "failed";

// 			return newSteps;
// 		});

// 		return;
// 	}

// 	const timeouts: number[] = [];

// 	if (verifyQuery.data) {
// 		setSteps((steps) => {
// 			const newSteps = [...steps];
// 			const index = newSteps.findIndex((step) => step.id === "login");
// 			newSteps[index]!.status = "success";

// 			return newSteps;
// 		});
// 		syncMutation.mutate();

// 		timeouts.push(
// 			setTimeout(() => {
// 				// Entrypoint.tsx will redirect to /app if userId is set
// 				// setUser(verifyQuery.data);
// 			}, 1000)
// 		);
// 	}

// 	return () => {
// 		timeouts.forEach(clearTimeout);
// 	};
// }, [verifyQuery.status]);

// useEffect(() => {
// 	if (syncMutation.isLoading) {
// 		setSteps((steps) => {
// 			const newSteps = [...steps];
// 			const index = newSteps.findIndex((step) => step.id === "sync");
// 			newSteps[index]!.status = "loading";

// 			return newSteps;
// 		});

// 		return;
// 	}

// 	if (syncMutation.isError) {
// 		setSteps((steps) => {
// 			const newSteps = [...steps];
// 			const index = newSteps.findIndex((step) => step.id === "sync");
// 			newSteps[index]!.status = "failed";

// 			return newSteps;
// 		});

// 		return;
// 	}

// 	const timeouts: number[] = [];

// 	if (syncMutation.isSuccess) {
// 		setSteps((steps) => {
// 			const newSteps = [...steps];
// 			const index = newSteps.findIndex((step) => step.id === "sync");
// 			newSteps[index]!.status = "success";

// 			return newSteps;
// 		});

// 		timeouts.push(
// 			setTimeout(() => {
// 				// Entrypoint.tsx will redirect to /app if userId is set
// 				// setUser(verifyQuery.data);
// 			}, 1000)
// 		);
// 	}
// }, [syncMutation.status]);

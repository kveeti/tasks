// from: Sam Selikoff's counter example
import {
	AnimatePresence,
	type MotionValue,
	motion,
	useMotionTemplate,
	useSpring,
	useTransform,
} from "framer-motion";
import { useEffect } from "react";

const fontSize = 88;
const height = fontSize + 28;

function getParts(seconds: number) {
	return {
		hours: Math.floor(seconds / 3600),
		srHours: pad(Math.floor(seconds / 3600)),
		minutes: Math.floor(seconds / 60),
		srMinutes: pad(Math.floor((seconds % 3600) / 60)),
		seconds: seconds % 60,
		srSeconds: pad(seconds % 60),
	};
}

function pad(n: number) {
	return n < 10 ? `0${n}` : n;
}

export function Counter(props: { seconds: number }) {
	const parts = getParts(props.seconds);

	return (
		<>
			<span aria-live="assertive" className="sr-only">
				duration:
				<time dateTime={`PT${parts.srHours}H${parts.srMinutes}M${parts.srSeconds}S`}>
					{parts.srHours}:{parts.srMinutes}:{parts.srSeconds}
				</time>
			</span>

			<div
				aria-hidden
				style={{ fontSize, lineHeight: "6.7rem" }}
				className="flex overflow-hidden mx-4"
			>
				<AnimatePresence>
					{parts.minutes >= 100 && (
						<motion.div
							className="overflow-hidden"
							initial={{ opacity: 0, width: 0 }}
							animate={{ opacity: 1, width: "auto" }}
							exit={{ opacity: 0, width: 0 }}
						>
							<Digit place={100} value={parts.minutes} />
						</motion.div>
					)}
				</AnimatePresence>

				<Digit place={10} value={parts.minutes} />
				<Digit place={1} value={parts.minutes} />
				<span>:</span>
				<Digit place={10} value={parts.seconds} />
				<Digit place={1} value={parts.seconds} />
			</div>
		</>
	);
}

export function Digit(props: { place: number; value: number }) {
	const valueRoundedToPlace = Math.floor(props.value / props.place);
	const animatedValue = useSpring(valueRoundedToPlace, { duration: 100, mass: 0.05 });

	useEffect(() => {
		animatedValue.set(valueRoundedToPlace);
	}, [animatedValue, valueRoundedToPlace]);

	return (
		<div style={{ height }} className="relative w-[1ch] tabular-nums">
			{Array(10)
				.fill(0)
				.map((_, i) => (
					<Number key={i} mv={animatedValue} number={i} />
				))}
		</div>
	);
}

function Number(props: { mv: MotionValue; number: number }) {
	const y = useTransform(props.mv, (latest) => {
		const placeValue = latest % 10;
		const offset = (10 + props.number - placeValue) % 10;

		let memo = offset * height;

		if (offset > 5) {
			memo -= 10 * height;
		}

		return memo;
	});

	const transform = useMotionTemplate`translate3d(0, ${y}px, 0)`;

	return (
		<motion.span
			style={{ transform }}
			className="absolute inset-0 flex items-center justify-center"
		>
			{props.number}
		</motion.span>
	);
}

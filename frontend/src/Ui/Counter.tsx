// from: Sam Selikoff's counter example
import { AnimatePresence, MotionValue, motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

const fontSize = 88;
const height = fontSize;

function getMinutesAndSeconds(seconds: number) {
	return {
		minutes: Math.floor(seconds / 60),
		seconds: seconds % 60,
	};
}

export function Time(props: { seconds: number }) {
	const time = getMinutesAndSeconds(props.seconds);

	return (
		<div style={{ fontSize }} className="flex overflow-hidden leading-none">
			<AnimatePresence>
				{time.minutes >= 100 && (
					<motion.div
						className="overflow-hidden"
						initial={{ opacity: 0, width: 0 }}
						animate={{ opacity: 1, width: "auto" }}
						exit={{ opacity: 0, width: 0 }}
					>
						<Digit place={100} value={time.minutes} />
					</motion.div>
				)}
			</AnimatePresence>

			<Digit place={10} value={time.minutes} />
			<Digit place={1} value={time.minutes} />
			<span>:</span>
			<Digit place={10} value={time.seconds} />
			<Digit place={1} value={time.seconds} />
		</div>
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
			{[...Array(10).keys()].map((i) => (
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

	return (
		<motion.span style={{ y }} className="absolute inset-0 flex items-center justify-center">
			{props.number}
		</motion.span>
	);
}

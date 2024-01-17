import {
	addMonths,
	addWeeks,
	addYears,
	endOfMonth,
	endOfWeek,
	endOfYear,
	format,
	startOfMonth,
	startOfWeek,
	startOfYear,
	subMonths,
	subWeeks,
	subYears,
} from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useReducer } from "react";

import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";

import { ChartHoursBy } from "./chart-hours-by";
import { ChartTagDistribution } from "./chart-tag-distribution";

export function AppNumbersPage() {
	const [state, dispatch] = useReducer(stateReducer, initialState);

	const formattedDate = formatDate(state.date, state.precision, state.timeframe);

	return (
		<PageLayout>
			<PageLayout.Title>stats</PageLayout.Title>

			<main className="flex gap-4 h-full relative flex-col overflow-auto bg-card p-4">
				<ChartHoursBy
					start={state.start}
					end={state.end}
					precision={state.precision}
					timeframe={state.timeframe}
				/>

				<ChartTagDistribution
					start={state.start}
					end={state.end}
					precision={state.precision}
				/>
			</main>

			<PageLayout.Footer className="flex gap-4">
				<Button size="icon" onClick={() => dispatch(actions.scroll("left"))}>
					<ChevronLeftIcon className="w-5 h-5" />
				</Button>
				<Button
					size="icon"
					className="grow"
					onClick={() => dispatch(actions.rotateTimeframe())}
				>
					{formattedDate}
				</Button>
				<Button size="icon" onClick={() => dispatch(actions.scroll("right"))}>
					<ChevronRightIcon className="w-5 h-5" />
				</Button>
			</PageLayout.Footer>
		</PageLayout>
	);
}

function formatDate(date: Date, precision: "day" | "month", timeframe: "week" | "month" | "year") {
	if (precision === "day") {
		if (timeframe === "week") {
			return format(date, "'w' w");
		} else if (timeframe === "month") {
			return format(date, "MMMM yyyy");
		}
	} else if (precision === "month") {
		return format(date, "yyyy");
	}

	throw new Error("invalid precision");
}

type State = {
	date: Date;
	start: Date;
	end: Date;
	precision: "day" | "month";
	timeframe: "week" | "month" | "year";
};
const initialState = {
	date: new Date(),
	start: startOfWeek(new Date(), { weekStartsOn: 1 }),
	end: endOfWeek(new Date(), { weekStartsOn: 1 }),
	precision: "day",
	timeframe: "week",
} satisfies State;

const actions = {
	rotateTimeframe: () => ({ type: "ROTATE_TIMEFRAME" }) as const,
	scroll: (direction: "left" | "right") => ({ type: "SCROLL", direction }) as const,
};

type Action = ReturnType<(typeof actions)[keyof typeof actions]>;

function stateReducer(state: State, action: Action): State {
	if (action.type === "ROTATE_TIMEFRAME") {
		if (state.timeframe === "week") {
			return {
				...state,
				timeframe: "month",
				precision: "day",
				start: startOfMonth(state.date),
				end: endOfMonth(state.date),
			};
		} else if (state.timeframe === "month") {
			return {
				...state,
				timeframe: "year",
				precision: "month",
				start: startOfYear(state.date),
				end: endOfYear(state.date),
			};
		} else if (state.timeframe === "year") {
			return {
				...state,
				timeframe: "week",
				precision: "day",
				start: startOfWeek(state.date, { weekStartsOn: 1 }),
				end: endOfWeek(state.date, { weekStartsOn: 1 }),
			};
		}
	} else if (action.type === "SCROLL") {
		if (state.precision === "day") {
			if (state.timeframe === "week") {
				if (action.direction === "left") {
					const newDate = subWeeks(state.date, 1);

					return {
						...state,
						start: startOfWeek(newDate),
						end: endOfWeek(newDate),
						date: newDate,
					};
				}

				const newDate = addWeeks(state.date, 1);

				return {
					...state,
					start: startOfWeek(newDate),
					end: endOfWeek(newDate),
					date: newDate,
				};
			} else if (state.timeframe === "month") {
				if (action.direction === "left") {
					const newDate = subMonths(state.date, 1);

					return {
						...state,
						start: startOfMonth(newDate),
						end: endOfMonth(newDate),
						date: newDate,
					};
				}

				const newDate = addMonths(state.date, 1);

				return {
					...state,
					start: startOfMonth(newDate),
					end: endOfMonth(newDate),
					date: newDate,
				};
			}
		} else if (state.precision === "month") {
			if (action.direction === "left") {
				const newDate = subYears(state.date, 1);

				return {
					...state,
					start: startOfYear(newDate),
					end: endOfYear(newDate),
					date: newDate,
				};
			}

			const newDate = addYears(state.date, 1);

			return {
				...state,
				start: startOfYear(newDate),
				end: endOfYear(newDate),
				date: newDate,
			};
		}
	}

	throw new Error("invalid action");
}

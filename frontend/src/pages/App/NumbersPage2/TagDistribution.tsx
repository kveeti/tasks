import * as d3 from "d3";
import differenceInSeconds from "date-fns/differenceInSeconds";
import secondsToHours from "date-fns/secondsToHours";
import { useLiveQuery } from "dexie-react-hooks";
import { Fragment } from "react";
import useMeasure from "react-use-measure";

import { type DbTag, db } from "@/db/db";

export function TagDistributionChart(props: { selectedDate: Date }) {
	const [ref, bounds] = useMeasure();

	const data = useData(props.selectedDate);

	const color = getColor(data.map((d) => d.tag.label));

	return (
		<>
			<h2 className="text-lg font-bold">tag distribution</h2>

			<div className="my-2 border-b border-b-gray-800/70" />

			<div ref={ref} className="h-[200px] p-2">
				<Chart data={data} width={bounds.width} height={bounds.height} />
			</div>

			<div className="flex flex-col divide-y divide-solid divide-gray-800/70 text-sm">
				{data.map((d, i) => (
					<div key={i} className="flex items-center gap-2 py-2">
						<div
							className="h-3 w-3 rounded-full"
							style={{ backgroundColor: color(d.tag.label) }}
						/>
						<div className="flex w-full justify-between gap-2">
							<span>{d.tag.label}</span>

							<div className="flex gap-8">
								<span>{d.percentage}%</span>
								<span>{secondsToHours(d.seconds)} h</span>
							</div>
						</div>
					</div>
				))}
			</div>
		</>
	);
}

function Chart(props: { data: Data; width: number; height: number }) {
	const radius = props.height / 2;

	const arc = d3
		.arc()
		.innerRadius(radius * 0.55)
		.outerRadius(radius - 1);

	const pie = d3
		.pie<Data[number]>()
		.padAngle(0.005)
		.value((d) => d.seconds);

	const color = getColor(props.data.map((d) => d.tag.label));

	const pieData = pie(props.data);

	return (
		<svg viewBox={`0 0 ${props.width} ${props.height}`}>
			<g transform={`translate(${props.width / 2}, ${props.height / 2})`}>
				{pieData.map((d, i) => (
					<Fragment key={i}>
						<path d={arc(d) ?? ""} fill={color(d.data.tag.label)}>
							<title>{`${d.data.tag.label}: ${d.data.percentage}`}</title>
						</path>

						<text
							key={i}
							transform={`translate(${arc.centroid(d)})`}
							dy=".35em"
							textAnchor="middle"
							fill="currentColor"
							className="text-[12px] text-white"
						>
							{d.data.percentage}%
						</text>
					</Fragment>
				))}
			</g>
		</svg>
	);
}

function useData(selectedDate: Date) {
	const dbTasks = useLiveQuery(() => db.tasks.toArray(), []);
	const dbTags = useLiveQuery(() => db.tags.toArray(), []);
	const dbTasksWith = dbTasks?.map((task) => ({
		...task,
		seconds: differenceInSeconds(task.stopped_at ?? task.expires_at, task.created_at),
	}));

	const totalSeconds = dbTasksWith?.reduce((acc, cur) => acc + cur.seconds, 0) || 0;

	const data =
		dbTags?.reduce(
			(acc, cur) => {
				const tasks = dbTasksWith?.filter((d) => d.tag_id === cur.id) ?? [];

				const taskSeconds = tasks
					.filter((d) => d.tag_id === cur.id)
					.reduce((acc, cur) => acc + cur.seconds, 0);

				acc.push({
					tag: cur,
					seconds: taskSeconds,
					percentage: Math.round((taskSeconds / totalSeconds) * 100),
				});

				return acc;
			},
			[] as {
				tag: DbTag;
				seconds: number;
				percentage: number;
			}[]
		) || [];

	return data;
}

type Data = ReturnType<typeof useData>;

function getColor(labels: string[]) {
	return d3
		.scaleOrdinal()
		.range(d3.quantize((t) => d3.interpolateSpectral(t * 0.8 + 0.1), labels.length).reverse());
}

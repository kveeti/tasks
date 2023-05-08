import toast from "react-hot-toast";

import { Card } from "~ui/Card";
import type { RouterOutputs } from "~utils/trpc";

import { LogJson } from "./LogJson";

export const Log = ({ log }: { log: RouterOutputs["admin"]["getLogs"]["logs"][number] }) => {
	const executor = log.actors.filter((actor) => actor.sequenceType === "Executor").at(0);
	const target = log.actors.filter((actor) => actor.sequenceType === "Target").at(0);
	const targetOwner = log.actors.filter((actor) => actor.sequenceType === "TargetOwner").at(0);

	const copy = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);

			toast.success("Copied to clipboard");
		} catch (err) {
			toast.error("Failed to copy to clipboard");
		}
	};

	return (
		<Card key={log.id} className="rounded-xl">
			<div className="space-y-2 p-2">
				<h2 className="text-lg font-bold">{log.logType}</h2>
				<div className="flex flex-col gap-2 text-sm">
					{executor && (
						<Card
							variant={2}
							className="rounded-md"
							onClick={() => copy(executor.actorId)}
						>
							<div className="flex flex-col p-2">
								<h2 className="font-bold">Executor ({executor.actorType}):</h2>
								<p>{executor.actorId}</p>
							</div>
						</Card>
					)}

					{target && (
						<Card
							variant={2}
							className="rounded-md"
							onClick={() => copy(target.actorId)}
						>
							<div className="flex flex-col p-2">
								<h2 className="font-bold">Target ({target.actorType}):</h2>
								<p>{target.actorId}</p>
							</div>
						</Card>
					)}

					{targetOwner && (
						<Card
							variant={2}
							className="rounded-md"
							onClick={() => copy(targetOwner.actorId)}
						>
							<div className="flex flex-col p-2">
								<h2 className="font-bold">
									Target Owner ({targetOwner.actorType}):
								</h2>
								<p>{targetOwner.actorId}</p>
							</div>
						</Card>
					)}
				</div>

				<LogJson log={log} />
			</div>
		</Card>
	);
};

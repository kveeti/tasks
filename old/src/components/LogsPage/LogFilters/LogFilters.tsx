import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { AnimatedChevron } from "~ui/AnimatedChevron";
import { Card } from "~ui/Card";
import { Input } from "~ui/Input";
import { Select } from "~ui/Select";

import type { LogFiltersForm } from "./useLogFiltersForm";

export const LogFilters = ({ form }: { form: LogFiltersForm }) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Card variant={2} className="mt-2 rounded-md">
			<div className="flex flex-col p-2">
				<div
					className="flex items-center justify-between"
					onClick={() => setIsOpen(!isOpen)}
				>
					<p>Filters</p>

					<Card variant={3} className="rounded-md">
						<div className="p-1">
							<AnimatedChevron open={isOpen} />
						</div>
					</Card>
				</div>

				<AnimatePresence initial={false}>
					{isOpen && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="flex flex-col gap-2"
						>
							<Select label="Log type" {...form.register("logType")}>
								<option value="all">All</option>

								<optgroup label="User">
									<option value="UpdateUser">UpdateUser</option>
									<option value="DeleteUser">DeleteUser</option>
								</optgroup>

								<optgroup label="Tag">
									<option value="CreateTag">CreateTag</option>
									<option value="UpdateTag">UpdateTag</option>
									<option value="DeleteTag">DeleteTag</option>
								</optgroup>

								<optgroup label="Task">
									<option value="CreateTask">CreateTask</option>
									<option value="StopTask">StopTask</option>
									<option value="UpdateTask">UpdateTask</option>
									<option value="DeleteTask">DeleteTask</option>
								</optgroup>
							</Select>

							<Input label="Executor ID" {...form.register("executorId")} />

							<Select label="Target type" {...form.register("targetType")}>
								<option value="all">All</option>
								<option value="User">User</option>
								<option value="Tag">Tag</option>
								<option value="Task">Task</option>
							</Select>

							<Input label="Target ID" {...form.register("targetId")} />
							<Input label="Target owner ID" {...form.register("targetOwnerId")} />
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</Card>
	);
};

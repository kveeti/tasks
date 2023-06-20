import { Menu } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Fragment } from "react";
import { z } from "zod";

import { Input } from "@/Ui/Input";
import { Label } from "@/Ui/Label";
import { Modal } from "@/Ui/Modal";
import { Button } from "@/Ui/NewButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Ui/Select";
import { cn } from "@/utils/classNames";
import { useForm } from "@/utils/useForm";

import { useTimerContext } from "../TimerContext";
import { WithAnimation } from "../WithAnimation";
import { TurnOnNotifications } from "./Notifications";

export function AppSettingsPage() {
	return (
		<WithAnimation>
			<div className="flex flex-col gap-2 p-4">
				<TurnOnNotifications />

				<AddTasks />
			</div>
		</WithAnimation>
	);
}

const addTasksFormSchema = z.object({
	start: z.string(),
	duration: z.number(),
	tagId: z.string(),
});

function AddTasks() {
	const { dbTags } = useTimerContext();
	const [isOpen, setIsOpen] = useState(false);

	const addTasksForm = useForm<z.infer<typeof addTasksFormSchema>>({
		defaultValues: {
			start: "",
			duration: 0,
			tagId: "",
		},
		onSubmit: (values) => {
			console.log(values);
		},
	});

	return (
		<>
			<Button onPress={() => setIsOpen(true)}>add tasks</Button>

			<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
				<div className="flex flex-col gap-4">
					<h1 className="text-2xl font-bold">add tasks</h1>

					<form onSubmit={addTasksForm.handleSubmit} className="flex flex-col gap-4">
						<Input type="datetime-local" label="start" required />

						<Input type="number" label="(h) duration" required />

						<div className="flex flex-col gap-1">
							<Label id="select-tag" required>
								tag
							</Label>

							{/* <Select
								required
								onValueChange={(v) => addTasksForm.setValue("tagId", v)}
							>
								<SelectTrigger>
									<SelectValue placeholder="select a tag" />
								</SelectTrigger>

								<SelectContent id="select-tag">
									{dbTags?.map((tag) => (
										<SelectItem value={tag.id}>
											<div className="flex items-center gap-3">
												<div
													className="h-3 w-3 rounded-full"
													style={{ backgroundColor: tag.color }}
												/>

												<span>{tag.label}</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select> */}

							<Menu as="div" className="relative z-10 inline-block">
								<Menu.Button className="flex w-full items-center justify-between rounded-xl border border-gray-600 bg-gray-800 p-3 outline-none outline-2 transition-[outline,_color,_background,_border] duration-200 focus-visible:outline focus-visible:outline-gray-500">
									<span>select a tag</span>
									<ChevronDown className="h-4 w-4 opacity-50" />
								</Menu.Button>

								<Menu.Items className="absolute right-0 mt-1.5 w-full rounded-xl border border-gray-800 bg-gray-900 p-1.5 shadow-md outline-none">
									{dbTags?.map((tag) => (
										<Menu.Item key={tag.id} as={Fragment}>
											{({ active }) => (
												<div
													className={cn(
														"relative flex w-full cursor-default select-none items-center rounded-lg py-1.5 pl-8 pr-2 outline-none",
														active && "bg-gray-800"
													)}
												>
													{tag.label}
												</div>
											)}
										</Menu.Item>
									))}
								</Menu.Items>
							</Menu>
						</div>

						<div className="flex w-full gap-2 pt-2">
							<Button
								onPress={() => setIsOpen(false)}
								className="flex-1 p-4"
								isSecondary
							>
								cancel
							</Button>
							<Button className="flex-1 p-4" type="submit">
								add
							</Button>
						</div>
					</form>
				</div>
			</Modal>
		</>
	);
}

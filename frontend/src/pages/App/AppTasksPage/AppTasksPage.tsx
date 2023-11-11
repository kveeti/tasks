import { valibotResolver } from "@hookform/resolvers/valibot";
import { useMutation } from "@tanstack/react-query";
import { CommandLoading } from "cmdk";
import {
	addDays,
	addHours,
	isToday,
	isTomorrow,
	isValid,
	isYesterday,
	parseISO,
	startOfDay,
	subDays,
} from "date-fns";
import format from "date-fns/format";
import { AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronsUpDownIcon, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { type Output, date, number, object, string, ulid } from "valibot";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	CommandDialogWithTrigger,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { WithInitialAnimation } from "@/components/with-initial-animation";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/utils/api/apiRequest";
import { useTags } from "@/utils/api/tags";
import { useTasks } from "@/utils/api/tasks";
import { useDialog } from "@/utils/use-dialog";

import { WithAnimation } from "../WithAnimation";

export function AppTasksPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const dayParam = searchParams.get("day");
	const selectedDay =
		dayParam && isValid(dayParam) ? startOfDay(parseISO(dayParam)) : startOfDay(new Date());

	const tasks = useTasks({ selectedDay });

	const formattedSelectedDay = isToday(selectedDay)
		? "today"
		: isYesterday(selectedDay)
		? "yesterday"
		: isTomorrow(selectedDay)
		? "tomorrow"
		: format(selectedDay, "EEE, MMMM do");

	function scrollTimeFrame(direction: "left" | "right") {
		setSearchParams({
			...searchParams,
			day: startOfDay(
				direction === "right" ? addDays(selectedDay, 1) : subDays(selectedDay, 1)
			).toISOString(),
		});
	}

	return (
		<WithAnimation>
			<div className="flex h-full w-full flex-col">
				<div className="flex items-center justify-between gap-4 p-4 border-b">
					<h1 className="text-2xl font-bold">tasks</h1>

					<AddTask selectedDay={selectedDay} />
				</div>

				<div className="flex h-full flex-col overflow-auto">
					<AnimatePresence initial={false}>
						{tasks.isLoading ? (
							<div>loading tasks...</div>
						) : tasks.isError ? (
							<div>failed to load tasks</div>
						) : tasks.data?.length ? (
							tasks.data.map((task) => (
								<WithInitialAnimation className="px-4 py-2 flex justify-between">
									<span>{task.id}</span>
								</WithInitialAnimation>
							))
						) : (
							<p className="p-8 text-center border-b">no tasks</p>
						)}
					</AnimatePresence>
				</div>

				<div className="border-t p-4">
					<div className="flex w-full justify-between gap-4">
						<Button
							className="p-3"
							variant="secondary"
							onClick={() => scrollTimeFrame("left")}
						>
							<ChevronLeft className="w-4 h-4" />
						</Button>

						<Button asChild variant="secondary">
							<span className="w-full">{formattedSelectedDay}</span>
						</Button>

						<Button
							className="p-3"
							variant="secondary"
							onClick={() => scrollTimeFrame("right")}
						>
							<ChevronRight className="w-4 h-4" />
						</Button>
					</div>
				</div>
			</div>
		</WithAnimation>
	);
}

const newTaskFormSchema = object({
	startDate: date(),
	startTime: string(),
	duration: number(),
	tagId: string([ulid("required")]),
});

function AddTask(props: { selectedDay: Date }) {
	const dialog = useDialog();
	const tags = useTags();

	const mutation = useMutation<
		unknown,
		unknown,
		{
			tag_id: string;
			started_at: string;
			expires_at: string;
		}
	>({
		mutationFn: (props) =>
			apiRequest({
				method: "POST",
				path: "/tasks",
				body: props,
			}),
	});

	const form = useForm<Output<typeof newTaskFormSchema>>({
		resolver: valibotResolver(newTaskFormSchema),
		defaultValues: {
			startDate: props.selectedDay,
			startTime: format(props.selectedDay, "HH:mm"),
			duration: 0,
			tagId: "",
		},
	});

	async function onSubmit(values: Output<typeof newTaskFormSchema>) {
		const start = new Date(`${format(values.startDate, "yyyy-MM-dd")}T${values.startTime}`);

		await mutation.mutateAsync({
			tag_id: values.tagId,
			started_at: start.toISOString(),
			expires_at: addHours(start, values.duration).toISOString(),
		});

		dialog.close();
	}

	return (
		<Dialog {...dialog.props}>
			<DialogTrigger asChild>
				<Button size="sm" variant="secondary">
					<Plus className="h-4 w-4" />
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogTitle>add a task</DialogTitle>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{!tags.data?.length && (
							<FormDescription>
								you dont have any tags yet.{" "}
								<Button asChild variant="link" size="link">
									<Link to={"/app/tags"}>create one</Link>
								</Button>{" "}
								to add a task
							</FormDescription>
						)}
						<div className="flex gap-2 w-full">
							<FormField
								control={form.control}
								name="startDate"
								render={({ field }) => (
									<FormItem className="flex flex-col w-full">
										<FormLabel required>start date</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn(
															"pl-3 flex justify-between font-normal",
															!field.value && "text-muted-foreground"
														)}
													>
														{field.value ? (
															format(field.value, "PPP")
														) : (
															<span>pick a date</span>
														)}
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
													disabled={(date) =>
														date > new Date() ||
														date < new Date("1900-01-01")
													}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="startTime"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel required>start time</FormLabel>
										<FormControl>
											<Input {...field} type="time" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="duration"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel required>duration (h)</FormLabel>
									<FormControl>
										<Input {...field} type="number" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{!!tags.data?.length && (
							<FormField
								control={form.control}
								name="tagId"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel required>tag</FormLabel>
										<FormControl>
											<TagSelect onSelect={field.onChange} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						<div className="float-right space-x-3">
							<DialogClose asChild>
								<Button variant="ghost">cancel</Button>
							</DialogClose>
							<Button
								type="submit"
								disabled={!tags.data?.length || mutation.isLoading}
							>
								add
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

function TagSelect({ onSelect }: { onSelect: (tagId: string) => void }) {
	const navigate = useNavigate();
	const tags = useTags();

	const [search, setSearch] = useState("");

	const shownTags = tags.data
		?.filter((tag) => tag.label.toLowerCase().includes(search.toLowerCase()))
		.sort((a, b) => a.label.localeCompare(b.label));

	return (
		<CommandDialogWithTrigger
			trigger={
				<Button type="button" variant="outline" className="flex justify-between">
					<span>select a tag</span>

					<ChevronsUpDownIcon className="h-4 w-4" />
				</Button>
			}
		>
			<CommandInput
				value={search}
				onValueChange={setSearch}
				placeholder="search for tags..."
			/>
			<CommandList>
				<CommandGroup>
					{tags.isLoading ? (
						<CommandLoading>loading tags...</CommandLoading>
					) : tags.isError ? (
						<CommandEmpty>failed to load tags</CommandEmpty>
					) : shownTags?.length ? (
						<>
							{shownTags.map((tag) => (
								<CommandItem key={tag.id} value={tag.id} onSelect={onSelect}>
									{tag.label}
								</CommandItem>
							))}
						</>
					) : null}

					{search && !shownTags?.length ? (
						<CommandItem
							onSelect={() =>
								search && navigate(`/app/tags?label=${encodeURIComponent(search)}`)
							}
						>
							create "{search}"
						</CommandItem>
					) : (
						<CommandEmpty>no tags found</CommandEmpty>
					)}
				</CommandGroup>
			</CommandList>
		</CommandDialogWithTrigger>
	);
}

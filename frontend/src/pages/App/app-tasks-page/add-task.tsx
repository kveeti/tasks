import { valibotResolver } from "@hookform/resolvers/valibot";
import { addHours, format } from "date-fns";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { type Output, date, number, object, string, ulid } from "valibot";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useTags } from "@/utils/api/tags";
import { useAddTask } from "@/utils/api/tasks";
import { cn } from "@/utils/classNames";
import { errorToast } from "@/utils/errorToast";
import { useDialog } from "@/utils/use-dialog";

const newTaskFormSchema = object({
	startDate: date(),
	startTime: string(),
	duration: number(),
	tagId: string([ulid("required")]),
});

export function AddTask() {
	const dialog = useDialog();

	return (
		<Dialog {...dialog.props}>
			<DialogTrigger asChild>
				<Button className="w-full" variant="secondary">
					add task
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogTitle>add task</DialogTitle>

				<AddTaskForm onSuccess={dialog.close} />
			</DialogContent>
		</Dialog>
	);
}

export function AddTaskForm({ onSuccess }: { onSuccess: () => void }) {
	const tags = useTags();
	const mutation = useAddTask();

	const form = useForm<Output<typeof newTaskFormSchema>>({
		resolver: valibotResolver(newTaskFormSchema),
		defaultValues: {
			startDate: new Date(),
			startTime: "00:00",
			duration: 0,
			tagId: "",
		},
	});

	function onSubmit(values: Output<typeof newTaskFormSchema>) {
		const start = new Date(`${format(values.startDate, "yyyy-MM-dd")}T${values.startTime}`);

		mutation
			.mutateAsync(
				{
					tag_id: values.tagId,
					started_at: start.toISOString(),
					expires_at: addHours(start, values.duration).toISOString(),
				},
				{ onSuccess }
			)
			.catch(errorToast("error adding task"));
	}

	return (
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
												date > new Date() || date < new Date("1900-01-01")
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
								<Input
									{...field}
									onChange={(e) =>
										field.onChange(e.target.value ? +e.target.value : "")
									}
									type="number"
									step={0.01}
								/>
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
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="select a tag" />
										</SelectTrigger>
									</FormControl>

									<SelectContent>
										{tags.data?.map((tag) => (
											<SelectItem key={tag.id} value={tag.id}>
												<div className="space-x-2 flex items-center">
													<div
														aria-hidden
														className={`w-3 h-3 rounded-full`}
														style={{
															backgroundColor: tag.color,
														}}
													/>
													<p>{tag.label}</p>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				<div className="float-right space-x-3">
					<DialogClose asChild>
						<Button variant="ghost">cancel</Button>
					</DialogClose>
					<Button type="submit" disabled={!tags.data?.length || mutation.isLoading}>
						add
					</Button>
				</div>
			</form>
		</Form>
	);
}

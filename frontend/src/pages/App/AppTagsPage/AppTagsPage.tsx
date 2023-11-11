import { valibotResolver } from "@hookform/resolvers/valibot";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { type Output, minLength, object, picklist, string } from "valibot";

import { Button } from "@/components/ui/button";
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
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { WithInitialAnimation } from "@/components/with-initial-animation";
import { useAddTag, useTags } from "@/utils/api/tags";
import { useDialog } from "@/utils/use-dialog";

import { WithAnimation } from "../WithAnimation";
import { tagColors } from "./ColorSelector";

export function AppTagsPage() {
	const tags = useTags();

	return (
		<WithAnimation>
			<div className="flex h-full w-full flex-col">
				<div className="flex items-center justify-between gap-4 p-4 border-b">
					<h1 className="text-2xl font-bold">tags</h1>

					<AddTag />
				</div>

				<div className="flex h-full flex-col overflow-auto">
					<AnimatePresence initial={false}>
						{tags.isLoading ? (
							<div>loading tags...</div>
						) : tags.isError ? (
							<div>failed to load tags</div>
						) : tags.data?.length ? (
							tags.data.map((tag) => (
								<WithInitialAnimation className="px-4 py-2 flex justify-between">
									<span>{tag.id}</span>
								</WithInitialAnimation>
							))
						) : (
							<p className="p-8 text-center border-b">no tags</p>
						)}
					</AnimatePresence>
				</div>
			</div>
		</WithAnimation>
	);
}

const newTagFormSchema = object({
	label: string([minLength(1, "required")]),
	color: picklist(tagColors),
});

function AddTag() {
	const dialog = useDialog();

	const mutation = useAddTag();

	const form = useForm<Output<typeof newTagFormSchema>>({
		resolver: valibotResolver(newTagFormSchema),
	});

	async function onSubmit(values: Output<typeof newTagFormSchema>) {
		await mutation.mutateAsync(values);

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
				<DialogTitle>add a tag</DialogTitle>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="label"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel required>label</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="color"
							render={({ field }) => (
								<FormItem>
									<FormLabel required>color</FormLabel>

									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="select a color" />
											</SelectTrigger>
										</FormControl>

										<SelectContent>
											{tagColors.map((color) => (
												<SelectItem key={color} value={color}>
													<div className="space-x-2 flex items-center">
														<div
															aria-hidden
															className={`w-3 h-3 rounded-full`}
															style={{ backgroundColor: color }}
														/>
														<p>{color}</p>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="float-right space-x-3">
							<DialogClose asChild>
								<Button variant="ghost">cancel</Button>
							</DialogClose>

							<Button type="submit" disabled={mutation.isLoading}>
								add
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

import { valibotResolver } from "@hookform/resolvers/valibot";
import { AnimatePresence } from "framer-motion";
import { MoreHorizontalIcon } from "lucide-react";
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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { type Tag, useAddTag, useDeleteTag, useTags } from "@/utils/api/tags";
import { errorToast } from "@/utils/errorToast";
import { useDialog } from "@/utils/use-dialog";

import { WithAnimation } from "../WithAnimation";
import { tagColors } from "./ColorSelector";

export function AppTagsPage() {
	const tags = useTags();

	return (
		<WithAnimation>
			<div className="flex h-full w-full flex-col">
				<div className="flex items-center justify-between gap-4 p-4 border-b">
					<h1 className="text-xl font-bold">tags</h1>
				</div>

				<div className="flex h-full flex-col overflow-auto bg-black">
					{tags.isLoading ? (
						<p className="p-8 text-center border-b">loading tags...</p>
					) : tags.isError ? (
						<p className="p-8 text-center border-b">error loading tags</p>
					) : !tags.data?.length ? (
						<p className="p-8 text-center border-b">no tags</p>
					) : (
						<ul className="divide-y border-b">
							<AnimatePresence initial={false}>
								{tags.data.map((tag) => (
									<WithInitialAnimation key={tag.id}>
										<div className="px-4 py-2 flex gap-4 items-center justify-between">
											<div className="flex gap-4 items-center">
												<div
													aria-hidden
													className={`w-3.5 h-3.5 rounded-full`}
													style={{ backgroundColor: tag.color }}
												/>
												<span>{tag.label}</span>
											</div>

											<TagMenu tag={tag} />
										</div>
									</WithInitialAnimation>
								))}
							</AnimatePresence>
						</ul>
					)}
				</div>

				<div className="border-t p-4">
					<AddTag />
				</div>
			</div>
		</WithAnimation>
	);
}

const newTagFormSchema = object({
	label: string([minLength(1, "required")]),
	color: picklist(tagColors, "required"),
});

function AddTag() {
	const dialog = useDialog();

	return (
		<Dialog {...dialog.props}>
			<DialogTrigger asChild>
				<Button className="w-full" variant="secondary">
					add tag
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogTitle>add a tag</DialogTitle>

				<AddTagForm onSuccess={dialog.close} />
			</DialogContent>
		</Dialog>
	);
}

function AddTagForm({ onSuccess }: { onSuccess: () => void }) {
	const mutation = useAddTag();

	const form = useForm<Output<typeof newTagFormSchema>>({
		resolver: valibotResolver(newTagFormSchema),
		defaultValues: { label: "" },
	});

	function onSubmit(values: Output<typeof newTagFormSchema>) {
		mutation.mutateAsync(values, { onSuccess }).catch(errorToast("error adding tag"));
	}

	return (
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

							<Select onValueChange={field.onChange} defaultValue={field.value}>
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
	);
}

function TagMenu({ tag }: { tag: Tag }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon">
					<MoreHorizontalIcon className="w-4 h-4" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent>
				<DropdownMenuItem>edit</DropdownMenuItem>
				<DeleteTag tag={tag} />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function DeleteTag({ tag }: { tag: Tag }) {
	const dialog = useDialog();
	const mutation = useDeleteTag();

	function onConfirm() {
		mutation
			.mutateAsync({ tagId: tag.id }, { onSuccess: dialog.close })
			.catch(errorToast("error deleting tag"));
	}

	return (
		<Dialog {...dialog.props}>
			<DialogTrigger asChild>
				<DropdownMenuItem
					onSelect={(e) => {
						e.preventDefault();
						dialog.open();
					}}
				>
					delete
				</DropdownMenuItem>
			</DialogTrigger>

			<DialogContent>
				<DialogTitle>delete tag</DialogTitle>

				<p>delete "{tag.label}"?</p>

				<div className="flex justify-end gap-3">
					<DialogClose asChild>
						<Button variant="ghost">cancel</Button>
					</DialogClose>

					<Button
						type="submit"
						variant="destructive"
						disabled={mutation.isLoading}
						onClick={onConfirm}
					>
						delete
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

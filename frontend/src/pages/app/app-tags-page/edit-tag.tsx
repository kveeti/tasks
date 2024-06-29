import { valibotResolver } from "@hookform/resolvers/valibot";
import { useForm } from "react-hook-form";
import * as v from "valibot";

import { SpinnerButton } from "@/components/spinner-button";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
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
import { type ApiTag, useEditTag } from "@/utils/api/tags";
import { errorToast } from "@/utils/errorToast";
import { useDialog } from "@/utils/hooks/use-dialog";
import { getTagColorName, tagColors } from "@/utils/tag-colors";

export function EditTag({ tag, onSuccess }: { tag: ApiTag; onSuccess: () => void }) {
	const dialog = useDialog();

	return (
		<Dialog {...dialog.props}>
			<DialogTrigger asChild>
				<DropdownMenuItem
					onSelect={(e) => {
						e.preventDefault();
						dialog.open();
					}}
				>
					edit
				</DropdownMenuItem>
			</DialogTrigger>

			<DialogContent>
				<DialogTitle>edit tag</DialogTitle>

				<EditTagForm
					tag={tag}
					onSuccess={() => {
						dialog.close();
						onSuccess();
					}}
				/>
			</DialogContent>
		</Dialog>
	);
}

const editTagFormSchema = v.object({
	label: v.pipe(v.string(), v.minLength(1, "required")),
	color: v.picklist(tagColors, "required"),
});

function EditTagForm({ tag, onSuccess }: { tag: ApiTag; onSuccess: () => void }) {
	const mutation = useEditTag();

	const form = useForm<v.InferOutput<typeof editTagFormSchema>>({
		resolver: valibotResolver(editTagFormSchema),
		defaultValues: {
			label: tag.label,
			color: tag.color,
		},
	});

	function onSubmit(values: v.InferOutput<typeof editTagFormSchema>) {
		mutation
			.mutateAsync({ tagId: tag.id, ...values }, { onSuccess })
			.catch(errorToast("error saving changes§"));
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
												<p>{getTagColorName(color)}</p>
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

					<SpinnerButton type="submit" spin={mutation.isPending}>
						save
					</SpinnerButton>
				</div>
			</form>
		</Form>
	);
}

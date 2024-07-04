import { SpinnerButton } from "@/components/spinner-button";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { type ApiTag, useDeleteTag } from "@/lib/api/tags";
import { errorToast } from "@/lib/error-toast";
import { useDialog } from "@/lib/hooks/use-dialog";

import { BaseTag } from "./base-tag";

export function DeleteTag({ tag, onSuccess }: { tag: ApiTag; onSuccess: () => void }) {
	const dialog = useDialog();
	const mutation = useDeleteTag();

	function onConfirm() {
		mutation
			.mutateAsync(
				{ tagId: tag.id },
				{
					onSuccess: () => {
						dialog.close();
						onSuccess();
					},
				}
			)
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

				<div className="space-y-3">
					<DialogDescription>are you sure you want to delete this tag?</DialogDescription>

					<div className="flex gap-3 p-3 items-center border rounded-md bg-card-item">
						<BaseTag tag={tag} />
					</div>
				</div>

				<div className="flex justify-end gap-3">
					<DialogClose asChild>
						<Button variant="ghost">cancel</Button>
					</DialogClose>

					<SpinnerButton
						type="submit"
						variant="destructive"
						spin={mutation.isPending}
						onClick={onConfirm}
					>
						delete
					</SpinnerButton>
				</div>
			</DialogContent>
		</Dialog>
	);
}

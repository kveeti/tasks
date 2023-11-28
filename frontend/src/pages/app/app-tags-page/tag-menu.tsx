import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { MoreHorizontalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import type { ApiTag } from "@/utils/api/tags";
import { useDialog } from "@/utils/use-dialog";

import { DeleteTag } from "./delete-tag";
import { EditTag } from "./edit-tag";

export function TagMenu({ tag }: { tag: ApiTag }) {
	const dialog = useDialog();

	return (
		<DropdownMenu {...dialog.props}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon">
					<MoreHorizontalIcon className="w-4 h-4" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent>
				<EditTag tag={tag} onSuccess={dialog.close} />
				<DeleteTag tag={tag} onSuccess={dialog.close} />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

import { MoreHorizontalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ApiTaskWithTag } from "@/utils/api/tasks";
import { useDialog } from "@/utils/hooks/use-dialog";

import { DeleteTask } from "./delete-task";

export function TaskMenu({ task }: { task: ApiTaskWithTag }) {
	const dialog = useDialog();

	return (
		<DropdownMenu {...dialog.props}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon">
					<MoreHorizontalIcon className="w-4 h-4" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent>
				<DropdownMenuItem>edit</DropdownMenuItem>
				<DeleteTask task={task} onSuccess={dialog.close} />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

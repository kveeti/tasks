import { MoreHorizontalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TaskWithTag } from "@/utils/api/tasks";

export function TaskMenu({ task }: { task: TaskWithTag }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon">
					<MoreHorizontalIcon className="w-4 h-4" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent>
				<DropdownMenuItem>edit</DropdownMenuItem>
				<DropdownMenuItem>delete</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

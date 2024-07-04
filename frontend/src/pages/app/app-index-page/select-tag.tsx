import { Label } from "@radix-ui/react-label";
import { SelectValue } from "@radix-ui/react-select";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { useTags } from "@/lib/api/tags";

import { BaseTag } from "../app-tags-page/base-tag";
import { useTimerContext } from "../timer-context";

export function SelectTag() {
	const { form, onGoingTask } = useTimerContext();
	const tags = useTags();

	return (
		<div className="mt-8">
			{onGoingTask ? (
				<div className="h-12 px-3 gap-3 border bg-card-item rounded-xl flex items-center">
					<BaseTag
						tag={{
							id: onGoingTask.tag_id,
							label: onGoingTask.tag_label,
							color: onGoingTask.tag_color,
						}}
					/>
				</div>
			) : tags.data?.length ? (
				<>
					<Label htmlFor="tag-select" className="sr-only">
						tag
					</Label>

					<Select
						onValueChange={(value) => {
							form.setValue("tagId", value);
						}}
						defaultValue={form.getValues("tagId") ?? undefined}
					>
						<SelectTrigger id="tag-select" className="min-w-[110px] w-full">
							<SelectValue placeholder="select a tag" />
						</SelectTrigger>

						<SelectContent>
							{tags.data?.map((tag) => (
								<SelectItem key={tag.id} value={tag.id}>
									<div className="space-x-3 flex items-center">
										<BaseTag tag={tag} />
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</>
			) : (
				<Button asChild>
					<Link to={"/app/tags"}>add tag</Link>
				</Button>
			)}
		</div>
	);
}

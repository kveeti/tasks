import { Label } from "@radix-ui/react-label";
import { SelectValue } from "@radix-ui/react-select";

import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { useTags } from "@/utils/api/tags";

import { BaseTag } from "../app-tags-page/base-tag";
import { useTimerContext } from "../timer-context";

export function SelectTag() {
	const { form, onGoingTask } = useTimerContext();
	const tags = useTags();

	return onGoingTask ? (
		<div className="mt-8 py-2 px-3 gap-3 border bg-black rounded-xl flex items-center">
			<BaseTag
				tag={{
					id: onGoingTask.tag_id,
					label: onGoingTask.tag_label,
					color: onGoingTask.tag_color,
				}}
			/>
		</div>
	) : (
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
				<SelectTrigger id="tag-select" className="mt-8 w-max">
					<SelectValue placeholder="select a tag" />
				</SelectTrigger>

				<SelectContent>
					{tags.data?.map((tag) => (
						<SelectItem key={tag.id} value={tag.id}>
							<div className="space-x-2 flex items-center">
								<BaseTag tag={tag} />
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</>
	);
}

import { SelectValue } from "@radix-ui/react-select";

import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { useTags } from "@/utils/api/tags";

import type { StartTaskForm } from "./AppIndexPage";

export function SelectTag({ form }: { form: StartTaskForm }) {
	const tags = useTags();

	return (
		<Select
			onValueChange={(value) => {
				form.setValue("tagId", value);
			}}
			defaultValue={form.getValues("tagId") ?? undefined}
		>
			<SelectTrigger className="mt-8 w-max">
				<SelectValue placeholder="select a tag" />
			</SelectTrigger>

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
	);
}

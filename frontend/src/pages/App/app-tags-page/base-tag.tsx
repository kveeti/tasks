import type { ApiTag } from "@/utils/api/tags";
import { tagColors2 } from "@/utils/tag-colors";

export function BaseTag({ tag }: { tag: ApiTag }) {
	const tagColor = tagColors2.find((c) => c[1] === tag.color);
	if (!tagColor) throw new Error(`tag color ${tag.color} not found`);
	const [colorName, color] = tagColor;

	return (
		<>
			<div
				aria-aria-labelledby={`tag-${tag.id}-color`}
				className={`w-3.5 h-3.5 rounded-full`}
				style={{ backgroundColor: color }}
			/>

			<span id={`tag-${tag.id}-color`} className="sr-only">
				tag color {colorName}
			</span>

			<div>
				<p>{tag.label}</p>
			</div>
		</>
	);
}

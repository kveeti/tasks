import { getTagColorName } from "@/lib/api/types";

export function BaseTag({
	tag,
}: {
	tag: {
		id: string;
		color: string;
		label: string;
	};
}) {
	const colorName = getTagColorName(tag.color);

	return (
		<>
			<div
				aria-hidden={colorName === "unknown"}
				aria-label={colorName !== "unknown" ? colorName : undefined}
				className={`w-3.5 h-3.5 rounded-full`}
				style={{ backgroundColor: tag.color }}
			/>

			<p>{tag.label}</p>
		</>
	);
}

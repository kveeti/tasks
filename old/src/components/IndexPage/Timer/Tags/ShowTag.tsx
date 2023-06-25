import { useTimerContext } from "../TimerContext";

export const ShowTag = () => {
	const { selectedTag } = useTimerContext();

	if (!selectedTag) return null;

	return (
		<div className="mt-7 rounded-md border border-gray-600 bg-gray-800 px-3 py-2">
			{selectedTag.label}
		</div>
	);
};

import { useState } from "react";

import { Modal } from "@/Ui/Modal";
import { Button } from "@/Ui/NewButton";
import { Tag } from "@/Ui/shared/Tag";

import { useTimerContext } from "../TimerContext";

export function SelectTag() {
	const { selectedTag, setSelectedTagId, dbTags } = useTimerContext();
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<Button className="px-4 py-2" onPress={() => setIsOpen(true)}>
				{selectedTag ? (
					<div className="flex items-center gap-2">
						<div
							className="h-3 w-3 rounded-full"
							style={{ backgroundColor: selectedTag.color }}
						/>

						<span>{selectedTag.label}</span>
					</div>
				) : (
					"select a tag"
				)}
			</Button>

			<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
				<div className="flex flex-col gap-4">
					<h1 className="text-2xl font-bold">select a tag</h1>

					<div className="flex w-full flex-col gap-2">
						{dbTags?.map((tag) => (
							<Tag
								tag={tag}
								onPress={() => {
									setSelectedTagId(tag.id);
									setIsOpen(false);
								}}
							/>
						))}
					</div>
				</div>
			</Modal>
		</>
	);
}

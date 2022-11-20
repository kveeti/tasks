import type { ApiTag } from "~types/apiTypes";
import { Button } from "~ui/Button";
import { Modal, useModal } from "~ui/Modal";

import { useTimerContext } from "../TimerContext";
import { CreateTag } from "./CreateTag/CreateTag";

export const SelectTag = () => {
	const { isModalOpen, closeModal, openModal } = useModal();
	const { setSelectedTag, isRunning, tags, selectedTag } = useTimerContext();

	const selectTag = (tag: ApiTag) => {
		setSelectedTag(tag);
		closeModal();
	};

	return (
		<>
			<Button onPress={openModal} isDisabled={isRunning} className="mt-7">
				{selectedTag?.label}
			</Button>

			<Modal title="Select a tag" isOpen={isModalOpen} closeModal={closeModal}>
				<div className="flex max-h-[290px] flex-col gap-2 overflow-auto px-4 py-2">
					{tags?.map((tag) => (
						<Button key={tag.id} onPress={() => selectTag(tag)}>
							{tag.label}
						</Button>
					))}
				</div>

				<div className="mt-2 flex flex-col px-4 pb-4">
					<CreateTag />
				</div>
			</Modal>
		</>
	);
};

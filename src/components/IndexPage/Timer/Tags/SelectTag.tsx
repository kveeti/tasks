import type { ApiTag } from "~types/apiTypes";
import { Button } from "~ui/Button";
import { Modal, useModal } from "~ui/Modal";

import { CreateTag } from "./CreateTag/CreateTag";

type Props = {
	setSelectedTag: (selectedTag: ApiTag) => void;
	selectedTag: ApiTag | null;
	tags: ApiTag[];
	disabled?: boolean;
};

export const SelectTag = ({ setSelectedTag, selectedTag, tags, disabled }: Props) => {
	const { isModalOpen, closeModal, openModal } = useModal();

	const selectTag = (tag: ApiTag) => {
		setSelectedTag(tag);
		closeModal();
	};

	return (
		<>
			<Button onPress={openModal} isDisabled={disabled}>
				{selectedTag?.label}
			</Button>

			<Modal title="Select a tag" isOpen={isModalOpen} closeModal={closeModal}>
				<div className="flex max-h-[290px] flex-col gap-2 overflow-auto px-4 py-2">
					{tags.map((tag) => (
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

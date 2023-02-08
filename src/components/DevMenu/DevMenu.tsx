import { Modal, useModal } from "~ui/Modal";
import { useHotkeys } from "~utils/use-hotkeys";

import { AddTasks } from "./AddTasks";
import { DeleteTasks } from "./DeleteTasks";

export function DevMenu() {
	const { closeModal, isModalOpen, openModal } = useModal();

	useHotkeys([["mod+j", openModal]]);

	return (
		<>
			<Modal isOpen={isModalOpen} closeModal={closeModal} title="Dev menu">
				<div className="flex flex-col gap-3 px-4 pb-4 pt-2">
					<AddTasks />

					<DeleteTasks />
				</div>
			</Modal>
		</>
	);
}

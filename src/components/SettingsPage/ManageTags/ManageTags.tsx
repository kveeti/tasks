import { CreateTag } from "~components/_shared/CreateTagModal/CreateTagModal";
import { Button } from "~ui/Button";
import { Card } from "~ui/Card";
import { Modal, useModal } from "~ui/Modal";
import type { RouterOutputs } from "~utils/trpc";

import { DeleteTag } from "./DeleteTag";
import { EditTag } from "./EditTag";

type Props = {
	tags: RouterOutputs["me"]["tags"]["getAll"];
};

export const ManageTags = ({ tags }: Props) => {
	return tags?.length ? <ManageTagsModal tags={tags} /> : <CreateTag />;
};

export const ManageTagsModal = ({ tags }: Props) => {
	const { isModalOpen, closeModal, openModal } = useModal();

	return (
		<>
			<Button onClick={openModal} className="mt-7">
				Manage tags
			</Button>

			<Modal title="Manage your tags" isOpen={isModalOpen} closeModal={closeModal}>
				<div className="mx-4 mt-4 mb-0 flex max-h-[290px] flex-col gap-2 overflow-auto py-1">
					{tags?.map((tag) => (
						<Card
							variant={2}
							className="flex flex-col gap-2 rounded-md p-2"
							key={tag.id}
						>
							<div className="flex items-center gap-2">
								<div
									className={"h-6 w-6 rounded-md"}
									style={{ backgroundColor: tag.color }}
								/>
								<h2>{tag.label}</h2>
							</div>
							<div className="flex gap-2">
								<DeleteTag tag={tag} />
								<EditTag tag={tag} />
							</div>
						</Card>
					))}
				</div>

				<div className="flex flex-col px-4 pb-4">
					<CreateTag btnAsSubmit />
				</div>
			</Modal>
		</>
	);
};

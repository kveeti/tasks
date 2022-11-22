import toast from "react-hot-toast";

import { Button } from "~ui/Button";
import { Modal, useModal } from "~ui/Modal";
import { RouterOutputs, trpc } from "~utils/trpc";

type Props = {
	tag: RouterOutputs["me"]["tags"]["getAll"][number];
};

export const DeleteTag = ({ tag }: Props) => {
	const { isModalOpen, closeModal, openModal } = useModal();

	const utils = trpc.useContext();
	const mutation = trpc.me.tags.deleteTag.useMutation();

	const onSubmit = async () => {
		try {
			await toast.promise(mutation.mutateAsync({ tagId: tag.id }), {
				loading: "Deleting tag...",
				success: "Deleted!",
				error: "Failed to delete tag :(",
			});

			utils.me.tags.getAll.invalidate();
			closeModal();
		} catch (err) {
			toast.error(err.message);
		}
	};

	return (
		<>
			<Button onClick={openModal} className="w-full">
				Delete
			</Button>

			<Modal title={`Delete ${tag.label}`} isOpen={isModalOpen} closeModal={closeModal}>
				<div className="flex flex-col gap-2 px-4 pb-4 pt-2">
					<div className="flex flex-col gap-1">
						<p>Are you sure you want to delete the tag {`"${tag.label}"`}</p>
						<p>
							<b>Note:</b> this will delete all task data under the tag
						</p>
					</div>

					<div className="grid grid-cols-2 gap-2 pt-2">
						<Button onClick={closeModal}>Cancel</Button>
						<Button
							intent="submit"
							disabled={mutation.isLoading}
							onClick={() => onSubmit()}
						>
							{mutation.isLoading ? "Deleting..." : "Delete"}
						</Button>
					</div>
				</div>
			</Modal>
		</>
	);
};

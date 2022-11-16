import { Dialog } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useRef, useState } from "react";

type Props = {
	title: string;
	children: ReactNode;
	isOpen: boolean;
	closeModal: () => void;
};

export const Modal = ({ title, children, isOpen, closeModal }: Props) => {
	const ref = useRef<HTMLHeadingElement | null>(null);

	return (
		<AnimatePresence>
			{isOpen && (
				<Dialog
					static
					as="div"
					className="relative z-10"
					onClose={closeModal}
					open={isOpen}
				>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{
							opacity: 1,
							transition: { duration: 0.13, ease: "easeOut" },
						}}
						exit={{
							opacity: 0,
							transition: { duration: 0.11, ease: "easeIn" },
						}}
						className="fixed inset-0 bg-p-900/50 backdrop-blur-sm"
					/>

					<div className="fixed inset-0 mx-3 overflow-y-auto">
						<div className="flex min-h-full items-center justify-center text-center">
							<Dialog.Panel
								as={motion.div}
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{
									opacity: 1,
									scale: 1,
									transition: { duration: 0.06, ease: "easeOut" },
								}}
								exit={{
									opacity: 0,
									scale: 0.95,
									transition: { duration: 0.04, ease: "easeIn" },
								}}
								className="w-full max-w-sm transform rounded-xl border border-p-700 bg-p-800 text-left align-middle shadow-xl transition-all"
							>
								<Dialog.Title
									ref={ref}
									as="h3"
									className="px-4 pt-4 text-lg font-medium leading-6"
								>
									{title}
								</Dialog.Title>

								{children}
							</Dialog.Panel>
						</div>
					</div>
				</Dialog>
			)}
		</AnimatePresence>
	);
};

export const useModal = () => {
	const [isModalOpen, setIsOpen] = useState(false);

	const openModal = () => {
		setIsOpen(true);
	};

	const closeModal = () => {
		setIsOpen(false);
	};

	return {
		isModalOpen,
		openModal,
		closeModal,
	};
};

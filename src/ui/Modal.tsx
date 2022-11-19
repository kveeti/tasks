import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode, useRef, useState } from "react";

import { Card } from "./Card";

type Props = {
	title: string;
	children: ReactNode;
	isOpen: boolean;
	closeModal: () => void;
};

export const Modal = ({ title, children, isOpen, closeModal }: Props) => {
	const ref = useRef<HTMLHeadingElement | null>(null);

	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog static as="div" className="relative z-10" onClose={closeModal} open={isOpen}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-[150ms]"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-[130ms]"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="bg-primary-1200/50 fixed inset-0 backdrop-blur-sm" />
				</Transition.Child>

				<div className="fixed inset-0 mx-3 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center text-center">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-[150ms]"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-[100ms]"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<Dialog.Panel
								as={Card}
								className="w-full max-w-sm transform rounded-xl text-left align-middle shadow-xl transition-all"
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
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
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

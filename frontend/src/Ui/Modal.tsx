import { Dialog, Transition } from "@headlessui/react";
import { Fragment, type ReactNode } from "react";

type Props = { children: ReactNode; isOpen: boolean; onClose: () => void };

export function Modal(props: Props) {
	return (
		<Transition appear show={props.isOpen} as={Fragment}>
			<Dialog as="div" open={props.isOpen} onClose={props.onClose} className="relative z-10">
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-200"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-gray-900/10 backdrop-blur-[5px]" />
				</Transition.Child>

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-150"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<Dialog.Panel className="min-h-[20rem] w-full max-w-md transform overflow-hidden rounded-[30px] border border-gray-400/20 bg-gray-500/30 p-6 shadow-xl backdrop-blur-xl transition-all">
								{props.children}
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
}

Modal.Title = Dialog.Title;
Modal.Description = Dialog.Description;

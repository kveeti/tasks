"use client";

import { useState } from "react";

export function useDialog() {
	const [isOpen, setIsOpen] = useState(false);

	function open() {
		setIsOpen(true);
	}

	function close() {
		setIsOpen(false);
	}

	return {
		open,
		close,
		props: {
			isOpen,
			onOpenChange: setIsOpen,
		},
	};
}

export type UseDialog = ReturnType<typeof useDialog>;

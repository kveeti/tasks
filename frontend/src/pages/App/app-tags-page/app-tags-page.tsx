import { AnimatePresence, motion } from "framer-motion";

import { WithEnterExitAnimation } from "@/components/with-initial-animation";
import { type ApiTag, useTags } from "@/utils/api/tags";

import { WithAnimation } from "../WithAnimation";
import { AddTag } from "./add-tag";
import { BaseTag } from "./base-tag";
import { TagMenu } from "./tag-menu";

export function AppTagsPage() {
	const tags = useTags();

	return (
		<WithAnimation>
			<div className="flex h-full w-full flex-col">
				<div className="flex items-center justify-between gap-4 p-4 border-b">
					<h1 className="text-xl font-bold">tags</h1>
				</div>

				<div className="flex relative h-full flex-col overflow-auto bg-black">
					{tags.isLoading ? (
						<p className="p-8 text-center border-b">loading tags...</p>
					) : tags.isError ? (
						<p className="p-8 text-center border-b">error loading tags</p>
					) : (
						<AnimatePresence initial={false} mode="popLayout">
							<ul
								key="tags"
								className="border-b divide-y"
								aria-hidden={!tags.data.length}
							>
								<AnimatePresence initial={false}>
									{tags.data?.map((tag) => (
										<li key={tag.id}>
											<WithEnterExitAnimation>
												<Tag tag={tag} />
											</WithEnterExitAnimation>
										</li>
									))}
								</AnimatePresence>
							</ul>

							{!tags.data?.length && (
								<motion.p
									key="no-tags"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1, transition: { delay: 0.5 } }}
									exit={{ opacity: 0, transition: { duration: 0.2 } }}
									className="absolute p-8 border-b w-full text-center"
								>
									no tags
								</motion.p>
							)}
						</AnimatePresence>
					)}
				</div>

				<div className="border-t p-4">
					<AddTag />
				</div>
			</div>
		</WithAnimation>
	);
}

function Tag({ tag }: { tag: ApiTag }) {
	return (
		<div className="px-4 py-2 flex gap-4 items-center justify-between">
			<div className="flex gap-4 items-center">
				<BaseTag tag={tag} />
			</div>

			<TagMenu tag={tag} />
		</div>
	);
}

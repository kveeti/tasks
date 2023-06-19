import { motion } from "framer-motion";
import { Navigate, Route, Routes } from "react-router-dom";

import { useDevActions } from "./App/DevActions";
import { NumbersPage } from "./App/NumbersPage/NumbersPage";
import { TagsPage } from "./App/TagsPage/TagsPage";
import { Index, Test } from "./App/Test";

export function AuthenticatedApp() {
	useDevActions();

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.2 }}
		>
			<Routes>
				<Route path="/app" element={<Test />}>
					<Route index element={<Index />} />
					<Route path="stats" element={<NumbersPage />} />
					<Route path="tags" element={<TagsPage />} />
					<Route path="settings" element={<div />} />
				</Route>
				<Route path="*" element={<Navigate to="/app" />} />
			</Routes>
		</motion.div>
	);
}

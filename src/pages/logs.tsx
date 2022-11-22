import { Log } from "~components/LogsPage/Log/Log";
import { LogFilters } from "~components/LogsPage/LogFilters/LogFilters";
import { useLogFiltersForm } from "~components/LogsPage/LogFilters/useLogFiltersForm";
import { Layout } from "~ui/Layout/Layout";
import type { Page } from "~utils/PageType";
import { trpc } from "~utils/trpc";

export const LogsPage: Page = () => {
	const form = useLogFiltersForm();

	const logs = trpc.admin.getLogs.useInfiniteQuery(
		{ limit: 100, ...form.watch() },
		{ getNextPageParam: (lastPage) => lastPage.nextCursor }
	);

	return (
		<Layout title="Admin logs">
			<h1 className="pb-10 text-4xl font-bold">Logs</h1>

			<LogFilters form={form} />

			<div className="mt-2 flex flex-col gap-2">
				{logs.data?.pages.map((page) =>
					page.logs.map((log) => <Log key={log.id} log={log} />)
				)}
			</div>
		</Layout>
	);
};

LogsPage.requireAuth = true;
LogsPage.requireAdmin = true;

export default LogsPage;

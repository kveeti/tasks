import { AccountSettings } from "~components/SettingsPage/AccountSettings/AccountSettings";
import { DeleteAccount } from "~components/SettingsPage/DeleteAccount";
import { Layout } from "~ui/Layout/Layout";
import { Page } from "~utils/PageType";
import { trpc } from "~utils/trpc";

export const SettingsPage: Page = () => {
	const { data: me, isLoading, error } = trpc.me.getMe.useQuery();

	if (!me) return <div>loading</div>;

	return (
		<Layout>
			<h1 className="text-3xl font-bold">Settings</h1>

			<div className="mt-6 flex flex-col gap-8">
				<AccountSettings user={me} />

				<DeleteAccount />
			</div>
		</Layout>
	);
};

SettingsPage.requireAuth = true;

export default SettingsPage;

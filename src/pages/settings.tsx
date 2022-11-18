import { AccountSettings, SkeletonAccountSettings } from "~components/SettingsPage/AccountSettings";
import { DeleteAccount, SkeletonDeleteAccount } from "~components/SettingsPage/DeleteAccount";
import { ErrorCard } from "~ui/ErrorCard";
import { Layout } from "~ui/Layout/Layout";
import { Page } from "~utils/PageType";
import { trpc } from "~utils/trpc";

export const SettingsPage: Page = () => {
	const { data: me, isLoading, error } = trpc.me.getMe.useQuery();

	return (
		<Layout>
			<h1 className="pb-10 text-4xl font-bold">Settings</h1>

			<div className="flex flex-col gap-8">
				{isLoading ? (
					<>
						<SkeletonAccountSettings />
						<SkeletonDeleteAccount />
					</>
				) : error ? (
					<ErrorCard>
						<p>Failed to load settings</p>
					</ErrorCard>
				) : (
					<>
						<AccountSettings user={me} />
						<DeleteAccount />
					</>
				)}
			</div>
		</Layout>
	);
};

SettingsPage.requireAuth = true;

export default SettingsPage;

import { AccountSettings, SkeletonAccountSettings } from "~components/SettingsPage/AccountSettings";
import { DeleteAccount, SkeletonDeleteAccount } from "~components/SettingsPage/DeleteAccount";
import { ManageTags, SkeletonManageTags } from "~components/SettingsPage/ManageTags/ManageTags";
import { ErrorCard } from "~ui/ErrorCard";
import { Layout } from "~ui/Layout/Layout";
import type { Page } from "~utils/PageType";
import { classNames } from "~utils/classNames";
import { trpc } from "~utils/trpc";

export const SettingsPage: Page = () => {
	const { data: me, isLoading: meIsLoading, error: meError } = trpc.me.getMe.useQuery();
	const { data: tags, isLoading: tagsLoading, error: tagsError } = trpc.me.tags.getAll.useQuery();

	return (
		<Layout title="Settings">
			<h1 className="pb-10 text-4xl font-bold">Settings</h1>

			<div
				className={classNames(
					"flex flex-col gap-8",
					meIsLoading || (tagsLoading && "animate-pulse")
				)}
			>
				{meIsLoading || tagsLoading ? (
					<>
						<SkeletonManageTags />
						<SkeletonAccountSettings />
						<SkeletonDeleteAccount />
					</>
				) : meError || tagsError ? (
					<ErrorCard>
						<p>Failed to load settings</p>
					</ErrorCard>
				) : (
					<>
						<ManageTags tags={tags} />
						<AccountSettings user={me} />
						<DeleteAccount />
					</>
				)}
			</div>
		</Layout>
	);
};

SettingsPage.requireAuth = true;
SettingsPage.requireAdmin = false;

export default SettingsPage;

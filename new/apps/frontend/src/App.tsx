import { trpc } from "./api";

export function App() {
	const query = trpc.users.me.useQuery();

	return <div>{query.data?.email}</div>;
}

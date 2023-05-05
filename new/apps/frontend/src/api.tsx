import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ApiRouter } from "@tasks/api";
import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import { useState } from "react";
import superjson from "superjson";

export const trpc = createTRPCReact<ApiRouter>();

export function ApiProvider({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());
	const [trpcClient] = useState(() =>
		trpc.createClient({
			transformer: superjson,
			links: [httpBatchLink({ url: "http://localhost:5000" })],
		})
	);

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</trpc.Provider>
	);
}

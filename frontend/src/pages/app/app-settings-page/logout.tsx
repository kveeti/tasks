import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { apiRequest } from "@/utils/api/apiRequest";

export function Logout() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	return (
		<Button
			onClick={() =>
				toast.promise(
					apiRequest({
						method: "GET",
						path: "/auth/logout",
					}),
					{
						loading: "logging out...",
						success: "logged out",
						error: "error logging out",
						finally: async () => {
							await queryClient.cancelQueries();
							queryClient.resetQueries();
							navigate("/auth/login");
						},
					}
				)
			}
		>
			log out
		</Button>
	);
}

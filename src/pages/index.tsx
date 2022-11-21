import { Timer } from "~components/IndexPage/Timer/Timer";
import { Layout } from "~ui/Layout/Layout";
import type { Page } from "~utils/PageType";

const Home: Page = () => {
	return (
		<Layout>
			<Timer />
		</Layout>
	);
};

Home.requireAuth = true;
Home.requireAdmin = false;

export default Home;

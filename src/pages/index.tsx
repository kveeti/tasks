import { Timer } from "~components/IndexPage/Timer/Timer";
import { Layout } from "~ui/Layout/Layout";
import type { Page } from "~utils/PageType";

const Home: Page = () => {
	return (
		<Layout>
			<div className="mt-[5rem]" />

			<Timer />
		</Layout>
	);
};

Home.requireAuth = true;

export default Home;

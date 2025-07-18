import { useEffect } from "react";
import { Route, updateRoute } from "../../ui/Routing";
import Scaffold from "../../util/ui/Scaffold";
import Button from "../../util/ui/Button";
import DemoImage from "../images/demo.jpeg";

interface HomeProps { }

const Home: React.FC<HomeProps> = ({ }) => {
    useEffect(() => {
        updateRoute(Route.PETS);
    }, []);

    return <Scaffold
        header={headerUi()}
        footer={footerUi()}
        fontScale={1.5}
    >
        <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <img src={DemoImage} alt='' style={{ maxWidth: '100%', maxHeight: '100%' }} />
        </div>
    </Scaffold>;
};

function headerUi(): JSX.Element {
    return <div style={{ borderBottom: '5px solid blue' }}>
        <div>Header 1</div><div>Header 2</div><div>Header 3</div>
    </div>;
}

function footerUi(): JSX.Element {
    return <div style={{ display: 'flex', borderTop: '5px solid blue' }}>
        <Button>Greet</Button>
        <Button>Pet</Button>
        <Button>Feed</Button>
    </div>;
}

export default Home;

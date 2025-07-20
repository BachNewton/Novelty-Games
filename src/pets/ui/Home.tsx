import { useEffect } from "react";
import { Route, updateRoute } from "../../ui/Routing";
import Scaffold from "../../util/ui/Scaffold";
import Button from "../../util/ui/Button";
import PlaceholderImage from "../images/placeholder.jpg";
import TextReveal from "./TextReveal";

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
        <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <img src={PlaceholderImage} alt='' style={{ maxWidth: '100%', maxHeight: '100%' }} />
            <div style={{ position: 'absolute', top: '5px', left: '5px' }}>
                <div>Name: (Uknown)</div>
                <div>Age: (Uknown)</div>
                <div>Location: (Uknown)</div>
            </div>
            <div style={{ position: 'absolute', bottom: '5px', left: '5px', border: '2px solid var(--novelty-orange)', borderRadius: '15px', padding: '5px', backgroundColor: 'black' }}>
                <TextReveal>
                    Hello, I am a pet. This is my dialogue. This game is a work in progress. In the future I will say some really cute things.
                    Right now you can greet me, pet me, or feed me. But these are just some placeholder options and they don't do anything.
                </TextReveal>
            </div>
        </div>
    </Scaffold >;
};

function headerUi(): JSX.Element {
    return <div style={{ display: 'flex', borderBottom: '2px solid var(--novelty-blue)', padding: '5px' }}>
        <Button>PetName 1</Button>
        <Button>PetName 2</Button>
        <Button>PetName 3</Button>
    </div>;
}

function footerUi(): JSX.Element {
    return <div style={{ display: 'flex', borderTop: '2px solid var(--novelty-blue)', padding: '5px' }}>
        <Button>Greet</Button>
        <Button>Pet</Button>
        <Button>Feed</Button>
    </div>;
}

export default Home;

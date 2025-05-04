import { useEffect } from "react";
import { get } from "../../../trivia/logic/Repository";
import { DataType } from "../../../trivia/data/Data";

interface HomeProps { }

const Home: React.FC<HomeProps> = ({ }) => {
    useEffect(() => {
        get(DataType.FORTNITE_FESTIVAL, { emit: () => { } }).then(data => {
            console.log('Fortnite Festival data', data);
        });
    }, []);

    return <div style={{ color: 'white', fontSize: '1.5em' }}>
        <div style={{ margin: '15px' }}>
            <input type='checkbox' style={{ transform: 'scale(2.5)', marginRight: '15px' }} />
            <label>Pro Guitar</label>
            <br />
            <input type='checkbox' style={{ transform: 'scale(2.5)', marginRight: '15px' }} />
            <label>Drums</label>
            <br />
            <label>Difficulty Scalar</label>
            <input type='number' style={{ fontSize: '1em', width: '3em', marginLeft: '15px' }} value={1} />
        </div>

        <div style={{ borderTop: '3px solid var(--novelty-blue)', margin: '15px 0px' }} />
    </div>;
};

export default Home;

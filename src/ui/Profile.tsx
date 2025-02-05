import { useEffect, useState } from "react";
import { DEFAULT_USER_NAME, getProfile, Profile as ProfileData, updateProfile } from "../util/Profile";
import Dialog from "../util/ui/Dialog";
import Loading from "../util/ui/Loading";
import TextInput, { InputHolder } from "../util/ui/TextInput";

interface State { }

class LoadingState implements State { }

class ProfileState implements State {
    data: ProfileData;

    constructor(data: ProfileData) {
        this.data = data;
    }
}

class UpdateProfileState implements State {
    data: ProfileData;

    constructor(data: ProfileData) {
        this.data = data;
    }
}

const Profile: React.FC = () => {
    const [state, setState] = useState<State>(new LoadingState());

    useEffect(() => {
        getProfile().then(data => setState(new ProfileState(data)));
    }, []);

    if (state instanceof ProfileState) {
        return <TopRight>
            <div>
                Hello
                <span style={{ color: 'var(--novelty-blue)', margin: '0px 5px' }}>{state.data.name}</span>
                <button style={{ fontSize: '1em' }} onClick={() => setState(new UpdateProfileState(state.data))}>👤</button>
            </div>
        </TopRight>;
    } else if (state instanceof UpdateProfileState) {
        return <Dialog isOpen={true}>
            <UpdateProfile data={state.data} onUpdate={data => {
                updateProfile(data);
                setState(new ProfileState(data));
            }} />
        </Dialog>;
    } else {
        return <TopRight><Loading /></TopRight>;
    }
};

interface TopRightProps { children?: React.ReactNode }

const TopRight: React.FC<TopRightProps> = ({ children }) => {
    return <div style={{
        position: 'fixed',
        top: '0.25em',
        right: '0.25em'
    }}>
        {children}
    </div>;
};

interface UpdateProfileProps {
    data: ProfileData;
    onUpdate: (data: ProfileData) => void;
}

const UpdateProfile: React.FC<UpdateProfileProps> = ({ data, onUpdate }) => {
    const [inputHolder] = useState<InputHolder>({ input: '' });

    const update = () => onUpdate({ name: inputHolder.input || DEFAULT_USER_NAME, id: data.id });

    return <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '2em', fontWeight: 'bold', textAlign: 'center', marginBottom: '15px' }}>User Profile</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div>User Name:</div>
            <TextInput placeholder={data.name} holder={inputHolder} onEnter={update} />
            <div>ID:</div>
            <code>{data.id}</code>
        </div>

        <button style={{ fontSize: '1em', marginTop: '15px', padding: '5px' }} onClick={update}>Submit</button>
    </div>;
};


export default Profile;

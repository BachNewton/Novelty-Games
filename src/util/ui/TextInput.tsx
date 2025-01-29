import { useEffect, useRef } from "react";

interface TextInputProps {
    placeholder: string;
    onEnter: () => void;
    holder: InputHolder;
}

export interface InputHolder {
    input: string;
}

const TextInput: React.FC<TextInputProps> = ({ placeholder, onEnter, holder }) => {
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (ref.current === null) return;

        ref.current.focus();
    }, []);

    return <input
        ref={ref}
        style={{ fontSize: '1em' }}
        placeholder={placeholder}
        onChange={e => holder.input = e.target.value}
        onKeyDown={e => { if (e.key === 'Enter') onEnter() }}
    />;
};

export default TextInput;

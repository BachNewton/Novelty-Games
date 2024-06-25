export interface ProgressEvent {
    current: number;
    total: number;
}

export interface ProgressEmitter {
    emit: (event: ProgressEvent) => void;
}

export interface ProgressListener {
    setListener: (on: (event: ProgressEvent) => void) => void;
}

export class ProgressUpdater implements ProgressEmitter, ProgressListener {
    listener = (event: ProgressEvent) => { };
    emit(event: ProgressEvent) { this.listener(event) }
    setListener(listener: (event: ProgressEvent) => void) { this.listener = listener; }
}

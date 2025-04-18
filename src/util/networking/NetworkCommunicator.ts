export interface NetworkCommunicator {
    send: (eventName: string, data: any) => void;
    receive: (eventName: string, callback: (data: any) => void) => void;
}

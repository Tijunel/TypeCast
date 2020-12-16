import SocketIOClient from 'socket.io-client';

export default class SocketManager {
    static instance = null;
    constructor() {
        // CHANGE ME 
        // For AWS: http://[IP Address]/
        // For localhost: http://localhost:5000/
        this.socket = SocketIOClient('http://3.129.16.155');
    }

    getSocket = () => {
        return this.socket;
    }

    static createInstance = () => {
        if (this.instance === null) this.instance = new SocketManager();
    }

    static getInstance = () => {
        if (this.instance === null) {
            this.instance = new SocketManager();
            return this.instance;
        } 
        else return this.instance;
    }
}
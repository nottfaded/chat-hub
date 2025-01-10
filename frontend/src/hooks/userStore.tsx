import { create } from "zustand";

type UserStore = {
    username : string,
    socket : WebSocket | null,
}

type UserStoreActions = {
    setUsername: (username: string) => void,
    setSocket: (socket: WebSocket) => void,
}

const useUserStore = create<UserStore & UserStoreActions>((set) => ({
    username: '',
    socket: null,
    setUsername: (username) => set({ username }),
    setSocket: (socket) => set({ socket }),
}));

export default useUserStore;
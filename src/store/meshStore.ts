import { defineStore } from "pinia"

export const useMeshStore = defineStore('useMeshStore', {
    state: () => ({ mesh: 0 }),
    getters: {
        double: (state) => state.mesh,
    },
    actions: {
        set(mesh) {
            this.mesh = mesh
        },
    },
})
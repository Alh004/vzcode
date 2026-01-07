const baseUri = "http://localhost:5005/api/Rooms";

Vue.createApp({
    data() {
        return {            
            rooms: [],
            error: null
        };
    },

    methods: {
        getAllRooms() {
            this.error = null;

            axios.get(baseUri)
                .then(response => {
                    console.log("Fetched:", response.data);
                    this.rooms = response.data;
                })
                .catch(ex => {
                    this.rooms = [];
                    this.error = "Network or CORS error: " + ex.message;
                    console.error(ex);
                });
        }
    }
}).mount("#app");

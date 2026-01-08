const api = "http://localhost:5005/api/rooms";

Vue.createApp({
  data() {
    return {
      rooms: [],
      error: null,

      newRoom: {
        roomName: "",
        building: ""
      },

      createdRoom: null
    };
  },

  mounted() {
    this.loadRooms();
  },

  computed: {
    qrUrl() {
      if (!this.createdRoom) return "";
      return `http://127.0.0.1:5501/report.html?room=${this.createdRoom.roomId}`;
    },

    qrImageUrl() {
      if (!this.qrUrl) return "";
      return `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(this.qrUrl)}`;
    }
  },

  methods: {
    async loadRooms() {
      try {
        const res = await axios.get(api);
        this.rooms = res.data;
      } catch (e) {
        this.error = "Kunne ikke hente rooms";
      }
    },

    async createRoom() {
      if (!this.newRoom.roomName) {
        alert("Room navn mangler");
        return;
      }

      try {
        const res = await axios.post(api, this.newRoom);
        this.createdRoom = res.data;

        this.newRoom.roomName = "";
        this.newRoom.building = "";

        this.loadRooms();
      } catch (e) {
        alert("Fejl ved oprettelse af room");
      }
    },

    async deleteRoom(id) {
      if (!confirm("Vil du slette dette room?")) return;

      try {
        await axios.delete(`${api}/${id}`);
        this.loadRooms();
      } catch (e) {
        alert("Room kan ikke slettes (har issues)");
      }
    },

    // 🔽 DOWNLOAD QR
    downloadQr() {
      const link = document.createElement("a");
      link.href = this.qrImageUrl;
      link.download = `room-${this.createdRoom.roomId}-qr.png`;
      link.click();
    }
  }
}).mount("#app");

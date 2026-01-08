const api = "http://localhost:5005/api/rooms";

Vue.createApp({
  data() {
    return {
      rooms: [],
      error: null
    };
  },

  mounted() {
    // Data indlæses automatisk ved load
    // → Nielsen: Visibility of system status
    this.loadRooms();
  },

  methods: {
    // ===== DATA =====
    async loadRooms() {
      try {
        const res = await axios.get(api);
        this.rooms = res.data;
      } catch (e) {
        this.error = "Kunne ikke hente rooms";
      }
    },

    async deleteRoom(id) {
      // Bekræftelse før destruktiv handling
      // → Nielsen: Error prevention
      if (!confirm("Vil du slette dette room?")) return;

      try {
        await axios.delete(`${api}/${id}`);
        this.loadRooms();
      } catch (e) {
        alert("Room kan ikke slettes (har issues)");
      }
    },

    // ===== QR =====
    getQrUrl(roomId) {
      /*
        Unik URL pr. room
        → Sikrer entydig kobling mellem fysisk lokale og system
      */
      return `http://127.0.0.1:5501/report.html?room=${roomId}`;
    },

    getQrImageUrl(roomId) {
      return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(this.getQrUrl(roomId))}`;
    },

    downloadQr(roomId) {
      const link = document.createElement("a");
      link.href = this.getQrImageUrl(roomId);
      link.download = `room-${roomId}-qr.png`;
      link.click();
    },

    printQr(roomId) {
      const url = this.getQrImageUrl(roomId);
      const win = window.open("", "_blank");

      win.document.write(`
        <html>
          <head>
            <title>Print QR – Room ${roomId}</title>
            <style>
              body {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                font-family: Arial;
              }
              img {
                max-width: 80%;
              }
            </style>
          </head>
          <body>
            <img src="${url}">
            <script>
              window.onload = () => window.print();
            </script>
          </body>
        </html>
      `);

      win.document.close();
    }
  }
}).mount("#app");

const api = "http://localhost:5005";

Vue.createApp({
  data() {
    return {
      // =========================
      // ISSUES
      // =========================
      issues: [],
      error: null,
      selectedImage: null,
      filterStatus: "alle",

      // Dashboard
      period: 30,

      // =========================
      // ROOMS + QR
      // =========================
      newRoom: {
        roomName: "",
        building: ""
      },
      createdRoom: null
    };
  },

  mounted() {
    this.load();
  },

  computed: {
    // =========================
    // FILTER ISSUES
    // =========================
    filteredIssues() {
      if (this.filterStatus === "alle") return this.issues;
      return this.issues.filter(i => i.status === this.filterStatus);
    },

    // =========================
    // DASHBOARD
    // =========================
    openCount() {
      return this.issues.filter(i => i.status !== "Lukket").length;
    },

    periodIssues() {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - this.period);
      return this.issues.filter(i => new Date(i.createdAt) >= cutoff);
    },

    closedCount() {
      return this.periodIssues.filter(i => i.status === "Lukket").length;
    },

    avgResolution() {
      const closed = this.periodIssues.filter(i => i.closedAt);
      if (closed.length === 0) return 0;

      const days = closed.reduce((sum, i) => {
        return sum + (new Date(i.closedAt) - new Date(i.createdAt)) / 86400000;
      }, 0);

      return Math.round(days / closed.length);
    },

    // =========================
    // QR-KODE
    // =========================
    qrUrl() {
      if (!this.createdRoom) return "";
      return `http://127.0.0.1:5501/report.html?room=${this.createdRoom.roomId}`;
    },

    qrImageUrl() {
      if (!this.qrUrl) return "";
      return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(this.qrUrl)}`;
    }
  },

  methods: {
    // =========================
    // LOAD ISSUES
    // =========================
    async load() {
      try {
        const res = await fetch(`${api}/api/issue`);
        if (!res.ok) throw new Error("Kunne ikke hente issues");
        this.issues = await res.json();
      } catch (e) {
        this.error = e.message;
      }
    },

    // =========================
    // ISSUE ACTIONS
    // =========================
    openImage(url) {
      this.selectedImage = url;
    },

    async save(issue) {
      await axios.put(`${api}/api/issue/${issue.idissue}`, {
        status: issue.status,
        severity: issue.severity,
        categoryId: issue.categoryId
      });
      this.load();
    },

    // =========================
    // CREATE ROOM
    // =========================
    async createRoom() {
      if (!this.newRoom.roomName) {
        alert("Room navn mangler");
        return;
      }

      const res = await fetch(`${api}/api/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.newRoom)
      });

      if (!res.ok) {
        alert("Kunne ikke oprette room");
        return;
      }

      this.createdRoom = await res.json();
      this.newRoom.roomName = "";
      this.newRoom.building = "";
    },

    // =========================
    // QR ACTIONS
    // =========================
    downloadQr() {
      if (!this.qrImageUrl) return;

      const link = document.createElement("a");
      link.href = this.qrImageUrl;
      link.download = `QR-${this.createdRoom.roomName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

   printQr() {
  if (!this.qrImageUrl || !this.createdRoom) return;

  const win = window.open("", "_blank");

  win.document.write(`
<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="UTF-8">
  <title>Print QR</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }

    body {
      width: 210mm;
      height: 297mm;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: Arial, sans-serif;
    }

    .container {
      text-align: center;
      padding: 40px;
    }

    .headline {
      font-size: 34px;
      font-weight: bold;
      margin-bottom: 10px;
    }

    .subtext {
      font-size: 18px;
      margin-bottom: 30px;
      opacity: 0.85;
    }

    img {
      width: 400px;
      height: 400px;
    }

    .room {
      margin-top: 20px;
      font-size: 22px;
      font-weight: bold;
    }

    .url {
      margin-top: 15px;
      font-size: 13px;
      opacity: 0.6;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="container">

    <div class="headline">
      Oplever du et problem i dette lokale?
    </div>

    <div class="subtext">
      Scan QR-koden og meld det på 30 sekunder
    </div>

    <img src="${this.qrImageUrl}">

    <div class="room">
      ${this.createdRoom.roomName}
    </div>

    <div class="url">
      ${this.qrUrl}
    </div>

  </div>

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

const api = "http://localhost:5005";

Vue.createApp({
  data() {
    return {
      roomId: null,

      // Form
      title: "",
      description: "",
      email: "",
      imageUrl: null,

      // State
      submitting: false,
      successMessage: null,
      errorMessage: null,
      roomValidated: false
    };
  },

  async mounted() {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");

    // 🔒 1) Tjek at room findes i URL
    if (!room || isNaN(room)) {
      this.errorMessage = "Fejl: Ugyldigt room i URL (?room=1)";
      return;
    }

    const roomId = parseInt(room);

    // 🔒 2) Tjek at room findes i databasen
    try {
      const res = await fetch(`${api}/api/rooms`);
      if (!res.ok) throw new Error();

      const rooms = await res.json();
      const exists = rooms.some(r => r.roomId === roomId);

      if (!exists) {
        this.errorMessage = "Fejl: Lokalet findes ikke";
        return;
      }

      // ✅ Room er gyldigt
      this.roomId = roomId;
      this.roomValidated = true;
    } catch {
      this.errorMessage = "Kunne ikke validere lokale";
    }
  },

  methods: {
    // =========================
    // BILLEDE UPLOAD
    // =========================
    uploadImage(e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrl = reader.result;
      };
      reader.readAsDataURL(file);
    },

    // =========================
    // SEND REPORT
    // =========================
    async submitReport() {
      this.errorMessage = null;
      this.successMessage = null;

      if (!this.roomValidated) {
        this.errorMessage = "Room er ikke valideret";
        return;
      }

      if (!this.title || !this.description || !this.email) {
        this.errorMessage = "Udfyld alle felter";
        return;
      }

      this.submitting = true;

      try {
        const payload = {
          roomId: this.roomId,
          title: this.title,
          description: this.description,
          email: this.email,
          imageUrl: this.imageUrl
        };

        await axios.post(`${api}/api/report`, payload);

        this.successMessage = "Tak! Din indberetning er sendt.";
        this.title = "";
        this.description = "";
        this.email = "";
        this.imageUrl = null;
      } catch (e) {
        this.errorMessage =
          e.response?.data?.message || "Der opstod en fejl ved indsendelse";
      } finally {
        this.submitting = false;
      }
    }
  }
}).mount("#app");

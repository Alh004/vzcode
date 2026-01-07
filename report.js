const api = "http://localhost:5005";

Vue.createApp({
  data() {
    return {
      roomId: new URLSearchParams(location.search).get("room"),
      title: "",
      description: "",
      email: "",
      imageUrl: "",
      successMessage: "",
      errorMessage: "",
      submitting: false
    };
  },

  methods: {
    async uploadImage(e) {
      try {
        this.errorMessage = "";
        const file = e.target.files[0];
        if (!file) return;

        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", "campfeed");

        const r = await fetch(
          "https://api.cloudinary.com/v1_1/dzppdbkte/image/upload",
          { method: "POST", body: fd }
        );

        const json = await r.json();
        if (!json.secure_url) throw new Error("Billedupload fejlede");

        this.imageUrl = json.secure_url;
      } catch (err) {
        console.error(err);
        this.errorMessage = "Kunne ikke uploade billedet.";
      }
    },

    async submitReport() {
      try {
        this.successMessage = "";
        this.errorMessage = "";

        if (!this.roomId) {
          this.errorMessage = "Room mangler i URL (?room=1)";
          return;
        }

        if (!this.email.endsWith("@edu.zealand.dk")) {
          this.errorMessage = "Brug din skolemail (@edu.zealand.dk).";
          return;
        }

        if (!this.title.trim() || !this.description.trim()) {
          this.errorMessage = "Udfyld både titel og beskrivelse.";
          return;
        }

        this.submitting = true;

        const payload = {
          email: this.email.trim(),
          title: this.title.trim(),
          description: this.description.trim(),
          roomId: Number(this.roomId),
          imageUrl: this.imageUrl
          // 🚫 INGEN categoryId (kun admin)
        };

        const res = await axios.post(`${api}/api/report`, payload);

        // forventer: { issueId: ... } (som din kode gør)
        this.successMessage = "Sag oprettet! ID: " + res.data.issueId;

        // reset form
        this.title = "";
        this.description = "";
        this.email = "";
        this.imageUrl = "";
      } catch (err) {
        console.error(err);
        this.errorMessage = "Kunne ikke oprette sag. Prøv igen.";
      } finally {
        this.submitting = false;
      }
    }
  }
}).mount("#app");

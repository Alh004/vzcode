const api = "http://localhost:5005";

Vue.createApp({
  data() {
    return {
      roomId: null,

      // =========================
      // FORM FELTER
      // =========================
      title: "",
      description: "",
      email: "",
      imageUrl: null,

      // =========================
      // STATE / FEEDBACK
      // =========================
      submitting: false,

      /*
        successMessage vises i GRØN tekst i UI
        → Farve signalerer succes
        → Nielsen: Visibility of system status
      */
      successMessage: null,

      /*
        errorMessage vises i RØD tekst i UI
        → Farve signalerer fejl / problem
        → Nielsen: Help users recognize and diagnose errors
      */
      errorMessage: null,

      /*
        Bruges til at styre om "Send indberetning"-knappen
        må være aktiv eller ej
        → Nielsen: Error prevention
      */
      roomValidated: false
    };
  },

  async mounted() {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");

    // =========================
    // 🔒 FEJL: UGYLDIG URL
    // =========================
    if (!room || isNaN(room)) {
      /*
        errorMessage bliver rød i UI
        → Farver bruges til at skelne mellem OK og fejl
        → Nielsen: Visibility of system status
      */
      this.errorMessage = "Fejl: Ugyldigt room i URL (?room=1)";
      return;
    }

    const roomId = parseInt(room);

    // =========================
    // 🔒 VALIDER ROOM MOD BACKEND
    // =========================
    try {
      const res = await fetch(`${api}/api/rooms`);
      if (!res.ok) throw new Error();

      const rooms = await res.json();
      const exists = rooms.some(r => r.roomId === roomId);

      if (!exists) {
        /*
          Rød fejltekst → brugeren forstår straks at noget er galt
          → Nielsen: Help users recognize and diagnose errors
        */
        this.errorMessage = "Fejl: Lokalet findes ikke";
        return;
      }

      // =========================
      // ✅ SUCCESS: ROOM ER GYLDIGT
      // =========================
      this.roomId = roomId;
      this.roomValidated = true;

      /*
        Når roomValidated = true:
        - Send-knappen bliver aktiv (sort/gul)
        - Ingen fejl vises
        → Nielsen: User control and freedom
      */
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
        /*
          Preview vises direkte i UI
          → Gestalt: Nærhed (billede tæt på input)
          → Nielsen: Visibility of system status
        */
        this.imageUrl = reader.result;
      };
      reader.readAsDataURL(file);
    },

    // =========================
    // SEND REPORT
    // =========================
    async submitReport() {
      /*
        Nulstil tidligere feedback
        → Kun én farvet status ad gangen
        → Gestalt: Figur / baggrund
      */
      this.errorMessage = null;
      this.successMessage = null;

      if (!this.roomValidated) {
        this.errorMessage = "Room er ikke valideret";
        return;
      }

      if (!this.title || !this.description || !this.email) {
        /*
          RØD fejltekst ved manglende input
          → Nielsen: Error prevention
        */
        this.errorMessage = "Udfyld alle felter";
        return;
      }

      /*
        submitting = true:
        - Knappen bliver disabled
        - Teksten ændres til "Sender..."
        → Nielsen: Visibility of system status
      */
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

        /*
          GRØN succesbesked vises
          → Farve = succes
          → Nielsen: Visibility of system status
        */
        this.successMessage = "Tak! Din indberetning er sendt.";

        // Ryd formular → klar til ny handling
        this.title = "";
        this.description = "";
        this.email = "";
        this.imageUrl = null;
      } catch (e) {
        /*
          RØD fejltekst ved backend-fejl
          → Nielsen: Help users recognize and recover from errors
        */
        this.errorMessage =
          e.response?.data?.message || "Der opstod en fejl ved indsendelse";
      } finally {
        /*
          submitting = false:
          - Knappen aktiveres igen
          → Nielsen: User control and freedom
        */
        this.submitting = false;
      }
    }
  }
}).mount("#app");

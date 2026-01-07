const apiUrl = "https://localhost:7099/api/auth/login";

Vue.createApp({
  data() {
    return {
      username: "",
      password: "",
      error: null,
      success: null
    };
  },

  computed: {
    needsPassword() {
      const isEdu = this.username
        .trim()
        .toLowerCase()
        .endsWith("@edu.zealand.dk");

      if (!isEdu) {
        this.password = "";
      }

      return isEdu;
    }
  },

  methods: {
    async login() {
      this.error = null;
      this.success = null;

      if (!this.username.trim()) {
        this.error = "Username må ikke være tom";
        return;
      }

      if (this.needsPassword && !this.password) {
        this.error = "Password må ikke være tomt";
        return;
      }

      const payload = {
        username: this.username.trim(),
        password: this.needsPassword ? this.password : null
      };

      try {
        const res = await axios.post(apiUrl, payload, {
          withCredentials: true
        });

        const role = res.data.role?.toLowerCase();
        this.success = `Logget ind som ${role}`;

        // 🔐 ENSARTET REDIRECT
        if (role === "admin" || role === "staff") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "report.html";
        }

      } catch (err) {
        this.error =
          err.response?.data?.message ||
          err.response?.data ||
          "Login fejlede – tjek backend eller certifikat";
      }
    }
  }
}).mount("#app");

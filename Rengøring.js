const api = "http://localhost:5005";

Vue.createApp({
  data() {
    return {
      issues: [],
      filterStatus: "alle",   // ✅ NY
      error: null,
      selectedImage: null
    };
  },

  async mounted() {
    await this.load();
  },

  computed: {
    // ✅ STATUS FILTRERING
    filteredIssues() {
      if (this.filterStatus === "alle") {
        return this.issues;
      }
      return this.issues.filter(
        i => i.status === this.filterStatus
      );
    }
  },

  methods: {
    async load() {
      try {
        const r = await fetch(`${api}/api/issue`);
        if (!r.ok) throw new Error("Kunne ikke hente issues");

        const allIssues = await r.json();

        // 🧹 KUN RENGØRING (categoryId = 3)
        this.issues = allIssues.filter(
          i => Number(i.categoryId) === 3
        );
      } catch (e) {
        this.error = e.message;
      }
    },

    openImage(url) {
      this.selectedImage = url;
    },

    async save(issue) {
      await axios.put(`${api}/api/issue/${issue.idissue}`, {
        status: issue.status,
        severity: issue.severity,
        categoryId: issue.categoryId
      });

      alert("Gemt i databasen");
      this.load();
    }
  }
}).mount("#app");

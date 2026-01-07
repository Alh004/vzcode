const api = "http://localhost:5005";

Vue.createApp({
  data() {
    return {
      issues: [],
      error: null,
      selectedImage: null
    };
  },

  async mounted() {
    await this.load();
  },

  methods: {
    async load() {
      try {
        const r = await fetch(`${api}/api/issue`);
        if (!r.ok) throw new Error("Kunne ikke hente issues");

        const allIssues = await r.json();

        // 🏢 KUN ADMINISTRATIV (categoryId = 5)
        this.issues = allIssues.filter(
          i => Number(i.categoryId) === 5
        );

        console.log("ADMINISTRATIVE ISSUES:", this.issues);
      } catch (e) {
        console.error(e);
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

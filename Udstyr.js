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
        this.error = null;

        const r = await fetch(`${api}/api/issue`);
        if (!r.ok) throw new Error("Kunne ikke hente issues fra API");

        const allIssues = await r.json();

        // ✅ Kun Udstyr (categoryId = 2)
        this.issues = allIssues.filter(i => Number(i.categoryId) === 2);

        console.log("UDSTYR ISSUES:", this.issues);
      } catch (e) {
        console.error(e);
        this.error = e?.message || "Der skete en fejl ved hentning";
      }
    },

    openImage(url) {
      this.selectedImage = url;
    },

    async save(issue) {
      try {
        await axios.put(`${api}/api/issue/${issue.idissue}`, {
          status: issue.status,
          severity: issue.severity,
          categoryId: issue.categoryId
        });

        alert("Gemt i databasen");
        await this.load();
      } catch (e) {
        console.error(e);
        alert("Kunne ikke gemme ændringer");
      }
    }
  }
}).mount("#app");

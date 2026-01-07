const api = "http://localhost:5005";

Vue.createApp({
  data() {
    return {
      issues: [],
      error: null,
      selectedImage: null,
      filterStatus: "alle"
    };
  },

  mounted() {
    this.load();
  },

  computed: {
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

        this.issues = await r.json();
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

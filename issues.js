const issuesUri = "http://localhost:5005/api/issue";

Vue.createApp({
  data() {
    return {
      issues: [],
      error: null,
      filterStatus: "alle"
    };
  },

  computed: {
    filteredIssues() {
      if (this.filterStatus === "alle") {
        return this.issues;
      }

      if (this.filterStatus === "open") {
        return this.issues.filter(i => i.status !== "Lukket");
      }

      if (this.filterStatus === "closed") {
        return this.issues.filter(i => i.status === "Lukket");
      }

      return this.issues;
    }
  },

  methods: {
    async getAllIssues() {
      this.error = null;
      try {
        const res = await axios.get(issuesUri);
        this.issues = res.data;
      } catch (err) {
        this.error = err.message;
      }
    },

    async deleteIssue(id) {
      const ok = confirm("Er du sikker på at du vil slette denne issue?");
      if (!ok) return;

      try {
        await axios.delete(`${issuesUri}/${id}`);
        this.issues = this.issues.filter(i => i.idissue !== id);
      } catch {
        alert("Issue kunne ikke slettes");
      }
    },

    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString("da-DK", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    }
  },

  mounted() {
    this.getAllIssues();
  }
}).mount("#app");

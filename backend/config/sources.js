module.exports = {
    type: 'check',

    check: {
        token: process.env.CHECK_API_TOKEN,
        teamSlug: process.env.CHECK_TEAM_SLUG,
        apiUrl: process.env.CHECK_API_URL,
        interval: parseInt(process.env.CHECK_API_INTERVAL),
        fetchLimit: parseInt(process.env.CHECK_API_FETCH_LIMIT) || 1000, // Límite configurable
        enabled: true
    }
};

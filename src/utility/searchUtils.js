// searchUtils.js
export const searchUsersAndPosts = (query, data, limit = 3) => {
    if (!query) return [];

    query = query.toLowerCase();
    const filteredData = data.filter(item => {
        const { firstName, secondName, businessName, agriculturalInterests, postName } = item;
        return (
            (firstName && firstName.toLowerCase().includes(query)) ||
            (secondName && secondName.toLowerCase().includes(query)) ||
            (businessName && businessName.toLowerCase().includes(query)) ||
            (agriculturalInterests && agriculturalInterests.toLowerCase().includes(query)) ||
            (postName && postName.toLowerCase().includes(query))
        );
    });

    return filteredData.slice(0, limit);
};

export const getRecommendations = (query, data) => {
    if (!query) return [];
    return searchUsersAndPosts(query, data, 3); // return top 5 results as recommendations
};

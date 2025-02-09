import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Load environment variables (ensure BRAVE_API_KEY is set in your .env file)
const BRAVE_API_KEY = process.env.BRAVE_API_KEY;

async function getTopSearchLink(query) {
	// Return the link from the top Brave search result for the given query
	const url = 'https://api.search.brave.com/res/v1/web/search';
	const headers = {
		'Accept': 'application/json',
		'Accept-Encoding': 'gzip',
		'X-Subscription-Token': BRAVE_API_KEY,
	};
	const params = {
		q: query,
		result_filter: 'web',
		count: 1, // Request only the top result
	};

	try {
		const response = await axios.get(url, { headers, params });
		const results = response.data;

		if (results.web && results.web.results && results.web.results.length > 0) {
			const topResult = results.web.results[0];
			// Attempt to extract the link (could be under 'url' or 'link')
			const topLink = topResult.url || topResult.link;

			if (topLink) {
				return topLink;
			} else {
				console.log('No link found in the top result.');
			}
		} else {
			console.log('No web results found.');
		}
	} catch (error) {
		console.error(`Error during Brave search: ${error}`);
	}

	return null;
}

(async () => {
	const query = 'Python programming tutorials'; // CHANGE THIS
	const topLink = await getTopSearchLink(query);
	if (topLink) {
		console.log(`${topLink}`); // return value
	} else {
		console.log('No top link found.');
	}
})();
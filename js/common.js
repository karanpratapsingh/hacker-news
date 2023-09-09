export const API_URL = "https://hacker-news.firebaseio.com/v0";

/**
 * @param {string} id
 * @returns {Promise<Post | Comment>}
 */
export async function fetchItem(id) {
  return fetch(`${API_URL}/item/${id}.json`).then((res) => res.json());
}

/**
 * @param {string} url
 * @returns {string}
 */
function getPrimaryDomain(url) {
  if (!url) {
    return "";
  }

  const parsedUrl = new URL(url);
  const parts = parsedUrl.hostname.split(".").slice(-2);
  const primaryDomain = parts.join(".");
  return primaryDomain;
}

/**
 * @param {number} timestamp
 * @returns {string}
 */
export function formatRelativeTime(time) {
  const now = new Date();
  const timestamp = new Date(time * 1000);
  const secondsAgo = Math.floor((now - timestamp) / 1000);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (secondsAgo < 60) {
    return rtf.format(-secondsAgo, "second");
  } else if (secondsAgo < 3600) {
    const minutesAgo = Math.floor(secondsAgo / 60);
    return rtf.format(-minutesAgo, "minute");
  } else if (secondsAgo < 86400) {
    const hoursAgo = Math.floor(secondsAgo / 3600);
    return rtf.format(-hoursAgo, "hour");
  }

  const daysAgo = Math.floor(secondsAgo / 86400);
  return rtf.format(-daysAgo, "day");
}

/**
 * @param {Story} story
 * @returns {string}
 */
export const getStoryTemplate = ({ title, url, score, by, time }) => `
  <a class="text-title" href="${url}" target="_blank">${title}</a>
  <i class="text-muted">${getPrimaryDomain(url)}</i>
  <span class="text-muted">${score} points by ${by} ${formatRelativeTime(
  time
)}</span>
`;

/** @typedef {object} Post
 * @property {string} by
 * @property {number} descendants
 * @property {number} id
 * @property {number[]} kids
 * @property {number} score
 * @property {number} time
 * @property {string} title
 * @property {string} type
 * @property {string} url
 */

const HACKER_NEWS_API_URL = "https://hacker-news.firebaseio.com/v0";
const PAGE_SIZE = 10;
let stories = [];
let start = 0;
let end = PAGE_SIZE;

/**
 * @param {number} start
 * @param {number} end
 * @returns {Promise<void>}
 */
async function fetchStories() {
  return fetch(`${HACKER_NEWS_API_URL}/topstories.json`)
    .then((res) => res.json())
    .then((ids) => {
      stories = ids;
    });
}

/**
 * @returns {Promise<Post>}
 */
async function fetchItem(id) {
  return fetch(`${HACKER_NEWS_API_URL}/item/${id}.json`).then((res) =>
    res.json()
  );
}

/**
 * @param {number} start
 * @param {number} end
 * @returns {Promise<void>}
 */
async function paginateStories() {
  const postsPromises = stories.slice(start, end).map(fetchItem);

  try {
    const posts = await Promise.all(postsPromises);
    posts.forEach((post) => appendPost(post));
  } catch (error) {
    console.error(error);
  }
}

/**
 * @param {string} url
 * @returns {string}
 */
function getPrimaryDomain(url) {
  const parsedUrl = new URL(url);
  const parts = parsedUrl.hostname.split(".").slice(-2);
  const primaryDomain = parts.join(".");
  return primaryDomain;
}

/**
 * @param {number} timestamp
 * @returns {string}
 */
function formatRelativeTime(time) {
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
 * @param {Post} post
 * @returns {void}
 */
function appendPost(post) {
  const { by, score, time, title, url } = post;

  const posts = document.getElementById("posts");

  const template = `
        <a class="text-title" href="${url}" target="_blank">${title}</a>
        <i class="text-muted">${getPrimaryDomain(url)}</i>
        <span class="text-muted">${score} points by ${by}</span>
        <span class="text-muted">${formatRelativeTime(time)}</span>
    `;

  const postElement = document.createElement("div");
  postElement.classList.add("post");
  postElement.innerHTML = template;

  posts.appendChild(postElement);
}

fetchStories().then(() => {
  paginateStories(start, end);

  const body = document.querySelector("body");
  const moreBtn = document.createElement("button");
  moreBtn.id = "more";
  moreBtn.textContent = "More";
  body.appendChild(moreBtn);

  moreBtn.addEventListener("click", async () => {
    if (!stories.length) {
      console.error("no more stories");
      return;
    }

    start = end + 1;
    end = end + PAGE_SIZE;
    await paginateStories();
  });
});

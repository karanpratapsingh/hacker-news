import { API_URL, fetchItem, getStoryTemplate } from './common.js';

/** @typedef {object} Story
 * @property {number} id
 * @property {string} type
 * @property {string} title
 * @property {string} by
 * @property {number[]} kids
 * @property {number} descendants
 * @property {number} score
 * @property {number} time
 * @property {string} url
 */

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
  return fetch(`${API_URL}/topstories.json`)
    .then(res => res.json())
    .then(ids => {
      stories = ids;
    });
}

/**
 * @param {number} start
 * @param {number} end
 * @returns {Promise<void>}
 */
async function paginateStories() {
  const storiesPromises = stories.slice(start, end).map(fetchItem);

  try {
    const stories = await Promise.all(storiesPromises);
    stories.forEach(story => appendStory(story));
  } catch (error) {
    console.error(error);
  }
}

/**
 * @param {Story} story
 * @returns {void}
 */
function appendStory(story) {
  const stories = document.getElementById('stories');

  let template = getStoryTemplate(story);
  template += `<a class="text-muted" href="/story?id=${story.id}">comments</a>`;

  const storyElement = document.createElement('div');
  storyElement.classList.add('story');
  storyElement.innerHTML = template;

  stories.appendChild(storyElement);
}

fetchStories()
  .then(() => paginateStories(start, end))
  .then(() => {
    const body = document.querySelector('body');
    const moreBtn = document.createElement('button');
    moreBtn.id = 'more';
    moreBtn.textContent = 'More';
    body.appendChild(moreBtn);

    moreBtn.addEventListener('click', async () => {
      if (!stories.length) {
        console.warn('no more stories');
        return;
      }

      start = end + 1;
      end = end + PAGE_SIZE;
      await paginateStories();
    });
  });

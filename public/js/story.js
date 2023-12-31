import { fetchItem, formatRelativeTime, getStoryTemplate } from './common.js';

/** @typedef {object} Comment
 * @property {number} id
 * @property {string} by
 * @property {number[]} kids
 * @property {number} parent
 * @property {string} text
 * @property {number} time
 * @property {string} type
 */

async function appendComment(parentId, childId) {
  const parent = document.getElementById(parentId);

  const comment = await fetchItem(childId);
  const { id, by, kids, text, time, deleted } = comment;

  let replies = '';

  if (kids) {
    const total = kids.length;
    replies = `${total} ${total < 2 ? 'reply' : 'replies'}`;
  }

  let template = `
    <div class="comment-header">
        <span class="text-muted">by ${by} ${formatRelativeTime(time)}</span>
        <u id="${id}-replies" class="text-muted">${replies}</u>
    </div>
    <p>${text}</p>
    <a id="${id}-comments" />
  `;

  if (deleted) {
    template = `
      <i class="text-muted">deleted</i>
    `;
  }

  const commentElement = document.createElement('div');
  commentElement.id = id;
  commentElement.classList.add('comment');
  commentElement.innerHTML = template;
  parent.appendChild(commentElement);

  let clicked = false; // Closure state

  if (kids) {
    const repliesElement = document.getElementById(`${id}-replies`);

    if (repliesElement) {
      repliesElement.classList.add('pointer');

      repliesElement.onclick = event => {
        event.preventDefault();
        event.stopPropagation();

        if (!clicked) {
          const focusElement = document.getElementById(`${id}-comments`);

          kids.forEach(childId => {
            appendComment(id, childId); // Recursive call
          });

          if (focusElement) {
            focusElement.scrollIntoView({ block: 'center' });
          }
          clicked = true;
        }
      };
    }
  }
}

const url = new URL(window.location.href);
const storyId = url.searchParams.get('id');

if (!storyId) {
  throw new Error('invalid story id');
}

fetchItem(storyId).then(story => {
  document.title = story.title;

  const storySection = document.getElementById('story');

  const storyElement = document.createElement('div');
  storyElement.classList.add('story');
  storyElement.innerHTML = getStoryTemplate(story);

  storySection.appendChild(storyElement);

  story.kids.forEach(id => {
    appendComment('comments', id); // "comments" is the root element
  });
});

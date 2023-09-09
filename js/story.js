import {
  fetchItem,
  formatRelativeTime,
  getStoryTemplate
} from "./common.js";

/** @typedef {object} Comment
 * @property {string} by
 * @property {number} id
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

  let replies = "";

  if (kids) {
    const total = kids.length;
    replies = `${total} ${total < 2 ? "reply" : "replies"}`;
  }

  let template = `
    <div class="comment-header">
        <span class="text-muted">by ${by} ${formatRelativeTime(time)}</span>
        <span class="text-muted" style="text-align: right;">${replies}</span>
    </div>
    <p>${text}</p>
  `;

  if (deleted) {
    template = `
    <i class="text-muted">deleted</i>
  `;
  }

  const commentElement = document.createElement("div");
  commentElement.id = id;
  commentElement.classList.add("comment");
  commentElement.innerHTML = template;

  if (kids) {
    commentElement.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();

      kids.forEach((childId) => {
        appendComment(id, childId); // Recursive call
      });
    };
    commentElement.classList.add("pointer");
  }

  parent.appendChild(commentElement);
}

const url = new URL(window.location.href);
const storyId = url.searchParams.get("id");

if (!storyId) {
  throw new Error("invalid story id");
}

fetchItem(storyId).then((story) => {
  const storySection = document.getElementById("story");

  const storyElement = document.createElement("div");
  storyElement.classList.add("story");
  storyElement.innerHTML = getStoryTemplate(story);

  storySection.appendChild(storyElement);

  story.kids.forEach((id) => {
    appendComment("comments", id); // "comments" is the root element
  });
});

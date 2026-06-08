/**
 * 7. Interactive Instagram Cards (Likes, Hearts, Comments)
 */
import { showToast } from './toast.js';

export const initInstagramFeed = () => {
    const instagramCards = document.querySelectorAll('.instagram-card');

    if (!instagramCards.length) return;

    instagramCards.forEach(card => {
        const likeBtn = card.querySelector('.btn-like');
        const bookmarkBtn = card.querySelector('.btn-bookmark');
        const commentForm = card.querySelector('.ig-add-comment-form');
        const commentInput = card.querySelector('.ig-comment-input');
        const commentsList = card.querySelector('.ig-comments-list');
        const imageContainer = card.querySelector('.ig-image-container');
        const heartOverlay = card.querySelector('.ig-heart-overlay');
        const likesNumSpan = card.querySelector('.likes-num');
        const commentFocusBtn = card.querySelector('.btn-comment-focus');

        if (!likeBtn || !bookmarkBtn || !commentForm || !commentInput || !commentsList || !imageContainer || !heartOverlay || !likesNumSpan || !commentFocusBtn) {
            return;
        }

        let isLiked = false;
        let likesCount = parseInt(likesNumSpan.textContent) || 0;
        let isBookmarked = false;

        // Sync Like Action
        const toggleLike = (triggerHeartFlash = false) => {
            isLiked = !isLiked;
            if (isLiked) {
                likeBtn.classList.add('liked');
                likesCount++;
                if (triggerHeartFlash) {
                    // Flash Giant Heart Animation
                    heartOverlay.classList.add('active');
                    setTimeout(() => {
                        heartOverlay.classList.remove('active');
                    }, 800);
                }
            } else {
                likeBtn.classList.remove('liked');
                likesCount--;
            }
            likesNumSpan.textContent = likesCount;
        };

        // Like Button click
        likeBtn.addEventListener('click', () => toggleLike(true));

        // Double click image
        imageContainer.addEventListener('dblclick', () => {
            if (!isLiked) {
                toggleLike(true);
            } else {
                // Flash Heart anyway for visual confirmation
                heartOverlay.classList.add('active');
                setTimeout(() => {
                    heartOverlay.classList.remove('active');
                }, 800);
            }
        });

        // Bookmark Toggle
        bookmarkBtn.addEventListener('click', () => {
            isBookmarked = !isBookmarked;
            bookmarkBtn.classList.toggle('bookmarked', isBookmarked);
            if (isBookmarked) {
                showToast('Post bookmarked to your style curation boards.');
            }
        });

        // Comment Input Focus Shortcut
        commentFocusBtn.addEventListener('click', () => {
            commentInput.focus();
        });

        // Live Comment Add Submission
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = commentInput.value.trim();
            if (text) {
                // Append Comment
                const commentItem = document.createElement('div');
                commentItem.className = 'ig-comment-item';
                commentItem.innerHTML = `<span class="comment-username">guest.connoisseur</span> ${text}`;
                
                // Add to list and scroll it into view
                commentsList.appendChild(commentItem);
                commentsList.scrollTop = commentsList.scrollHeight;

                // Success Feedback
                commentInput.value = '';
                showToast('Thank you for your style feedback! Posted.');
            }
        });
    });
};

const updateCard = (jsonData) => {
    const chatCard = document.getElementById("chatCard");
    if (!chatCard) return;

    const createCard = ({ title, imageURL, description, url }) => `
        <a href="${url}" class="anchorCard" style="opacity: 0">
            <div class="card">
                ${title ? `<div class="title">${title}</div>` : ''}
                ${imageURL ? `<img class="image" loading="lazy" src="${imageURL}" alt="${title || 'Game'}" />` : ''}
                ${description ? `<div class="description">${description}</div>` : ''}
            </div>
        </a>
    `;

    chatCard.innerHTML = jsonData.map(createCard).join('');

    // Animate cards
    requestAnimationFrame(() => {
        chatCard.querySelectorAll('.anchorCard').forEach((card, i) => {
            setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.3s ease';
                card.style.opacity = '1';
            }, i * 100);
        });
    });
};

const sortBtn = document.querySelector('.catalog-sort');
const sortOptions = document.querySelector('.sort-options');

if (sortBtn && sortOptions) {
    sortBtn.addEventListener('click', () => {
        sortOptions.classList.toggle('open');
    });

    document.querySelectorAll('.sort-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.sort-option').forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            sortBtn.querySelector('.sort-selected span').textContent = option.textContent;
            sortOptions.classList.remove('open');
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.catalog-sort')) {
            sortOptions.classList.remove('open');
        }
    });
}
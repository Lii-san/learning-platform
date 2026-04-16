const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const leftArrow = document.querySelector('.slider-arrow:first-child');
const rightArrow = document.querySelector('.slider-arrow:last-child');

let currentSlide = 0;

function updateSlider() {
    slides.forEach(s => s.classList.remove('active'));
    slides[currentSlide].classList.add('active');

    dots.forEach(d => d.classList.remove('active'));
    dots[currentSlide].classList.add('active');

    if (currentSlide === 0) {
    leftArrow.classList.add('disabled');
    leftArrow.style.backgroundImage = "url('assets/ArrowleftDisabled.svg')";
        } else {
            leftArrow.classList.remove('disabled');
            leftArrow.style.backgroundImage = "url('assets/ArrowleftActive.svg')";
        }

        if (currentSlide === slides.length - 1) {
            rightArrow.classList.add('disabled');
            rightArrow.style.backgroundImage = "url('assets/ArrowrightDisabled.svg')";
        } else {
            rightArrow.classList.remove('disabled');
            rightArrow.style.backgroundImage = "url('assets/ArrowrightActive.svg')";
    }
}

function resetAutoSlide() {
    clearInterval(autoSlide);
    autoSlide = setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlider();
    }, 3500);
}



leftArrow.addEventListener('click', () => {
    if (currentSlide > 0) {
        currentSlide--;
        updateSlider();
    }
});

rightArrow.addEventListener('click', () => {
    if (currentSlide < slides.length - 1) {
        currentSlide++;
        updateSlider();
    }
});

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentSlide = index;
        updateSlider();
    });
});


document.querySelector('.filter-count').textContent = activeFilters;


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
        leftArrow.querySelector('img').src = 'assets/ArrowleftDisabled.svg';
    } else {
        leftArrow.classList.remove('disabled');
        leftArrow.querySelector('img').src = 'assets/ArrowleftActive.svg';
    }

    if (currentSlide === slides.length - 1) {
        rightArrow.classList.add('disabled');
        rightArrow.querySelector('img').src = 'assets/ArrowrightDisabled.svg';
    } else {
        rightArrow.classList.remove('disabled');
        rightArrow.querySelector('img').src = 'assets/ArrowrightActive.svg';
    }
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
$(document).ready(function () {
    $(".phone").mask('+7 (999)-999-99-99');
})



gsap.registerPlugin(ScrollTrigger);

window.addEventListener('DOMContentLoaded', () => {

    const panels = gsap.utils.toArray(".panel");

    if (!panels.length) return;

    // Все панели, кроме первой, начинаются ниже экрана
    gsap.set(panels.slice(1), {
        yPercent: 100
    });

    const stackTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".stack",
            start: "top top",
            end: () => "+=" + (panels.length - 1) * window.innerHeight,
            pin: true,
            scrub: true,
            invalidateOnRefresh: true
        }
    });

    // Каждая следующая панель плавно заезжает сверху предыдущей
    panels.slice(1).forEach(panel => {
        stackTl.to(panel, {
            yPercent: 0,
            ease: "none",
            duration: 1
        });
    });

});
























window.addEventListener('DOMContentLoaded', () => {

    const infrastTitle = document.querySelector(".infrast-title");
    const infrastSec   = document.querySelector(".infrast-sec");
    const tempEl       = document.querySelector(".temp");

    if (!infrastTitle || !infrastSec || !tempEl) return;

    const infraNumber = { value: 0 };

    gsap.set(infrastTitle, {
        opacity: 0,
        y: 320
    });

    const infraTl = gsap.timeline({
        scrollTrigger: {
            trigger: infrastSec,
            start: "top top",
            end: "+=150%",
            pin: true,
            scrub: true,
            anticipatePin: 1
        }
    });

    // 1. Появление
    infraTl.to(infrastTitle, {
        opacity: 1,
        y: 0,
        ease: "none",
        duration: 1
    }, 0);

    // 2. Счётчик
    infraTl.to(infraNumber, {
        value: 50,
        ease: "none",
        duration: 2,
        onUpdate() {
            tempEl.textContent = Math.round(infraNumber.value);
        }
    }, 0.3);

    // 3. Исчезновение — сразу после окончания счётчика, без паузы
    infraTl.to(infrastTitle, {
        y: -450,
        opacity: 0,
        ease: "none",
        duration: 2.3
    }, 2.3);

});



















window.addEventListener('DOMContentLoaded', () => {

    // ждём загрузки шрифта — иначе на сервере размеры букв
    // считаются неверно и слово "ломается"
    document.fonts.ready.then(init);

    function init() {

        const letters = gsap.utils.toArray('.northern-verb');
        const keepIndexes = [0, 1, 8, 9, 19];
        const keepLetters = keepIndexes.map(i => letters[i]);
        const hideLetters = letters.filter((_, i) => !keepIndexes.includes(i));
        const container = document.querySelector('.northern-anime');
        const mobileTitle = document.querySelector('.mobile-title');

        // изначально скрываем mobile-title (появится по скроллу)
        gsap.set(mobileTitle, { display: 'none', opacity: 0 });

        gsap.set(keepLetters, { position: 'relative', zIndex: 10 });

        // буква-якорь — задаёт итоговую линию по Y, сама никуда не двигается
        const anchorLetter = letters[8];

        function calcOffsets() {
            const targetWord = keepIndexes.map(i => letters[i].textContent).join('');
            const refStyle = window.getComputedStyle(keepLetters[0]);

            const temp = document.createElement('span');
            temp.style.position = 'fixed';
            temp.style.visibility = 'hidden';
            temp.style.left = '0';
            temp.style.top = '0';
            temp.style.whiteSpace = 'nowrap';
            temp.style.fontFamily = refStyle.fontFamily;
            temp.style.fontSize = refStyle.fontSize;
            temp.style.fontWeight = refStyle.fontWeight;
            temp.style.fontStyle = refStyle.fontStyle;
            temp.style.letterSpacing = refStyle.letterSpacing;
            temp.style.textTransform = refStyle.textTransform;

            const tempLetterSpans = [];
            targetWord.split('').forEach(ch => {
                const s = document.createElement('span');
                s.textContent = ch;
                temp.appendChild(s);
                tempLetterSpans.push(s);
            });

            document.body.appendChild(temp);

            const containerRect = container.getBoundingClientRect();
            const tempRect = temp.getBoundingClientRect();
            const targetLeft = containerRect.left + containerRect.width / 2 - tempRect.width / 2;
            const anchorRect = anchorLetter.getBoundingClientRect();

            const offsets = keepLetters.map((letter, i) => {
                const from = letter.getBoundingClientRect();
                const to = tempLetterSpans[i].getBoundingClientRect();
                const to_left = to.left - tempRect.left + targetLeft;

                return {
                    x: to_left - from.left,
                    y: anchorRect.top - from.top
                };
            });

            document.body.removeChild(temp);
            return offsets;
        }

        ScrollTrigger.matchMedia({

            // ===== ДЕСКТОП =====
            "(min-width: 768px)": function () {

                const offsets = calcOffsets();

                const tls = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.northern-sec',
                        start: 'top top',
                        end: '+=200%',
                        scrub: true,
                        pin: true,
                        invalidateOnRefresh: true
                    }
                });

                tls.to(hideLetters, {
                    opacity: 0,
                    y: 1,
                    stagger: 0.03,
                    duration: 1,
                    ease: 'power1.inOut'
                }, 0);

                keepLetters.forEach((letter, i) => {
                    tls.to(letter, {
                        x: offsets[i].x,
                        y: offsets[i].y,
                        duration: 1,
                        ease: 'power2.inOut'
                    }, 1);
                });
            },

            // ===== МОБИЛКА =====
            "(max-width: 767px)": function () {

                const tlm = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.northern-sec',
                        start: 'top top',
                        end: '+=150%',
                        scrub: true,
                        pin: true
                    }
                });

                // все буквы по очереди медленно исчезают
                tlm.to(letters, {
                    opacity: 0,
                    y: 1,
                    display: 'none',

                    stagger: 0.08,
                    duration: 1,
                    ease: 'power1.inOut'
                }, 0);

                // после исчезновения плавно появляется "СЕВЕР"
                tlm.to(mobileTitle, {
                    opacity: 1,
                    display: 'block',
                    duration: 1,
                    ease: 'power1.inOut'
                }, 1.2);
            }

        });

    }

});

















window.addEventListener('DOMContentLoaded', () => {

    const slides    = gsap.utils.toArray('.directions-slide');
    const contents  = gsap.utils.toArray('.directions-content');
    const numberEl  = document.querySelector('.directions-number');
    const lineEl    = document.querySelector('.directions-line');
    const lineInner = document.querySelector('.directions-line-inner');
    const total     = slides.length;
    let   current   = -1;

    // бегунок
    function updateLine(index) {
        const segH = lineEl.offsetHeight / total;
        gsap.to(lineInner, { top: index * segH, height: segH, duration: 0.4, ease: 'power2.inOut' });
    }

    function switchTo(index) {
        if (index === current) return;
        current = index;

        // картинки
        slides.forEach((s, i) => s.classList.toggle('active', i === index));

        // текст — просто меняем active класс, CSS сам анимирует через transition
        contents.forEach((c, i) => c.classList.toggle('active', i === index));

        // номер
        gsap.to(numberEl, {
            opacity: 0, duration: 0.2,
            onComplete: () => {
                numberEl.textContent = String(index + 1).padStart(2, '0');
                gsap.to(numberEl, { opacity: 0.8, duration: 0.3 });
            }
        });

        updateLine(index);
    }

    // инициализация
    switchTo(0);

    ScrollTrigger.create({
        trigger: '.directions-sec',
        start: 'top top',
        end: 'bottom bottom',
        pin: '.directions-pin',
        anticipatePin: 1,
        onUpdate: (self) => {
            const index = Math.min(total - 1, Math.floor(self.progress * total));
            switchTo(index);
        }
    });

});




















window.addEventListener('DOMContentLoaded', () => {

    const countEls = document.querySelectorAll('.count-scroll');

    countEls.forEach(el => {
        // берём исходный текст из HTML (например "15+" или "24")
        const original = el.textContent.trim();

        // отделяем число от суффикса
        const num = parseFloat(original);
        const suffix = original.replace(num, '').trim(); // "+" или "" (для 24)

        if (isNaN(num)) return;

        const obj = { val: 0 };
        el.textContent = '0';

        ScrollTrigger.create({
            trigger: '.scale-main',
            start: 'top 70%',
            once: true,
            onEnter: () => {
                gsap.to(obj, {
                    val: num,
                    duration: 2,
                    ease: 'power2.out',
                    onUpdate: () => {
                        el.textContent = Math.floor(obj.val);
                    },
                    onComplete: () => {
                        el.textContent = num + suffix;
                    }
                });
            }
        });
    });

});













// БЛОК БЕЗ ЦИФРЫ (mistakes)
// ============================
function initMistakes() {
    gsap.set(".mistakes-title", {
        opacity: 0,
        y: 320
    });

    const mistakesTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".mistakes-main",
            start: "top top",
            end: "+=150%",
            pin: true,
            scrub: true,
            anticipatePin: 1
        }
    });

    mistakesTl.to(".mistakes-title", {
        opacity: 1,
        y: 0,
        ease: "none",
        duration: 1
    }, 0);

    mistakesTl.to(".mistakes-title", {
        y: -450,
        opacity: 0,
        ease: "none",
        duration: 1
    }, 1.5);
}

window.addEventListener('DOMContentLoaded', () => {
    initMistakes();
});








window.addEventListener('load', () => {
    ScrollTrigger.refresh();
});




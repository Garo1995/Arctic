$(document).ready(function () {
    $(".phone").mask('+7 (999)-999-99-99');
})


gsap.registerPlugin(ScrollTrigger);

// на ноутбуках с масштабированием экрана (125%/150%) браузер отдаёт дробные
// пиксельные значения в getBoundingClientRect — без этого ScrollTrigger может
// пересчитывать позиции чуть иначе на разных DPI, что и даёт "разъезд" верстки
ScrollTrigger.config({ ignoreMobileResize: true });

// =====================================================
// БЛОК 1: STACK (панели)
// =====================================================
window.addEventListener('DOMContentLoaded', () => {

    const panels = gsap.utils.toArray(".panel");
    if (!panels.length) return;

    gsap.set(panels.slice(1), {
        yPercent: 100
    });

    const stackTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".stack",
            start: "top top",
            // функция, а не готовое число — пересчитывается на resize/refresh,
            // а не замораживается на неточном innerHeight в момент загрузки
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


// =====================================================
// БЛОК 2: INFRAST (счётчик)
// =====================================================
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
            anticipatePin: 1,
            invalidateOnRefresh: true
        }
    });

    infraTl.to(infrastTitle, {
        opacity: 1,
        y: 0,
        ease: "none",
        duration: 1
    }, 0);

    infraTl.to(infraNumber, {
        value: 50,
        ease: "none",
        duration: 2,
        onUpdate() {
            tempEl.textContent = Math.round(infraNumber.value);
        }
    }, 0.3);

    // исчезновение сразу после конца счётчика, без "мёртвой" паузы
    infraTl.to(infrastTitle, {
        y: -450,
        opacity: 0,
        ease: "none",
        duration: 1
    }, 2.3);

});


// =====================================================
// БЛОК 3: NORTHERN (сборка слова "СЕВЕР")
// =====================================================
window.addEventListener('DOMContentLoaded', () => {

    document.fonts.ready.then(init);

    function init() {

        const letters = gsap.utils.toArray('.northern-verb');
        if (!letters.length) return;

        const keepIndexes = [0, 1, 8, 9, 19];
        const keepLetters = keepIndexes.map(i => letters[i]);
        const hideLetters = letters.filter((_, i) => !keepIndexes.includes(i));
        const container = document.querySelector('.northern-anime');
        const mobileTitle = document.querySelector('.mobile-title');

        if (!container) return;

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

                // округляем — на экранах с масштабированием (125%/150%, часто
                // на ноутбуках) getBoundingClientRect отдаёт дробные пиксели,
                // которые иначе накапливаются и сдвигают буквы друг относительно друга
                return {
                    x: Math.round(to_left - from.left),
                    y: Math.round(anchorRect.top - from.top)
                };
            });

            document.body.removeChild(temp);
            return offsets;
        }

        ScrollTrigger.matchMedia({

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

            "(max-width: 767px)": function () {

                const tlm = gsap.timeline({
                    scrollTrigger: {
                        trigger: '.northern-sec',
                        start: 'top top',
                        end: '+=150%',
                        scrub: true,
                        pin: true,
                        invalidateOnRefresh: true
                    }
                });

                tlm.to(letters, {
                    opacity: 0,
                    y: 1,
                    display: 'none',
                    stagger: 0.08,
                    duration: 1,
                    ease: 'power1.inOut'
                }, 0);

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


// =====================================================
// БЛОК 4: DIRECTIONS (слайды с бегунком)
// =====================================================
window.addEventListener('DOMContentLoaded', () => {

    const slides    = gsap.utils.toArray('.directions-slide');
    const contents  = gsap.utils.toArray('.directions-content');
    const numberEl  = document.querySelector('.directions-number');
    const lineEl    = document.querySelector('.directions-line');
    const lineInner = document.querySelector('.directions-line-inner');
    const total     = slides.length;

    if (!total || !numberEl || !lineEl || !lineInner) return;

    let current = -1;

    function updateLine(index) {
        const segH = lineEl.offsetHeight / total;
        gsap.to(lineInner, { top: index * segH, height: segH, duration: 0.4, ease: 'power2.inOut' });
    }

    function switchTo(index) {
        if (index === current) return;
        current = index;

        slides.forEach((s, i) => s.classList.toggle('active', i === index));
        contents.forEach((c, i) => c.classList.toggle('active', i === index));

        gsap.to(numberEl, {
            opacity: 0, duration: 0.2,
            onComplete: () => {
                numberEl.textContent = String(index + 1).padStart(2, '0');
                gsap.to(numberEl, { opacity: 0.8, duration: 0.3 });
            }
        });

        updateLine(index);
    }

    // ждём полной загрузки (картинки слайдов), иначе lineEl.offsetHeight
    // и позиции ScrollTrigger посчитаются по неверным размерам
    window.addEventListener('load', () => {
        switchTo(0);

        ScrollTrigger.create({
            trigger: '.directions-sec',
            start: 'top top',
            end: 'bottom bottom',
            pin: '.directions-pin',
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                const index = Math.min(total - 1, Math.floor(self.progress * total));
                switchTo(index);
            }
        });
    });

});


// =====================================================
// БЛОК 5: COUNT-SCROLL (числовые счётчики)
// =====================================================
window.addEventListener('DOMContentLoaded', () => {

    const countEls = document.querySelectorAll('.count-scroll');
    if (!countEls.length) return;

    const parsed = [];

    countEls.forEach(el => {
        const original = el.textContent.trim();
        const match = original.match(/^(-?[\d.,]+)(.*)$/);
        if (!match) return;

        const num = parseFloat(match[1].replace(/,/g, ''));
        const suffix = match[2].trim();
        if (isNaN(num)) return;

        el.textContent = '0';
        parsed.push({ el, num, suffix });
    });

    if (!parsed.length) return;

    ScrollTrigger.create({
        trigger: '.scale-main',
        start: 'top 70%',
        once: true,
        onEnter: () => {
            parsed.forEach(({ el, num, suffix }) => {
                const obj = { val: 0 };
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
            });
        }
    });

});


// =====================================================
// БЛОК 6: MISTAKES
// =====================================================
window.addEventListener('DOMContentLoaded', () => {

    const mistakesTitle = document.querySelector(".mistakes-title");
    const mistakesMain   = document.querySelector(".mistakes-main");
    if (!mistakesTitle || !mistakesMain) return;

    gsap.set(mistakesTitle, {
        opacity: 0,
        y: 320
    });

    const mistakesTl = gsap.timeline({
        scrollTrigger: {
            trigger: mistakesMain,
            start: "top top",
            end: "+=150%",
            pin: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true
        }
    });

    mistakesTl.to(mistakesTitle, {
        opacity: 1,
        y: 0,
        ease: "none",
        duration: 1
    }, 0);

    // сразу после появления, без "мёртвой" паузы
    mistakesTl.to(mistakesTitle, {
        y: -450,
        opacity: 0,
        ease: "none",
        duration: 1
    }, 1);

});


// =====================================================
// ОБЩИЙ ПЕРЕСЧЁТ ПОСЛЕ ПОЛНОЙ ЗАГРУЗКИ СТРАНИЦЫ
// (картинки, шрифты, всё содержимое) — ОБЯЗАТЕЛЬНО В САМОМ КОНЦЕ ФАЙЛА
// =====================================================
window.addEventListener('load', () => {
    ScrollTrigger.refresh();
});

// =====================================================
// ПЕРЕСЧЁТ ПРИ ИЗМЕНЕНИИ РАЗМЕРА ОКНА / ЭКРАНА
// (перенос окна с большого монитора на ноутбук, смена масштаба
// браузера, поворот устройства и т.п.) — без этого ScrollTrigger
// продолжает использовать позиции, посчитанные под старый экран
// =====================================================
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
    }, 200);
});

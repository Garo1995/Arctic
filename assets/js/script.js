$(document).ready(function() {
    $(".phone").mask('+7 (999)-999-99-99');
});


gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.config({
    ignoreMobileResize: true
});

function vh() {
    return window.innerHeight;
}

function pinDefaults(extra = {}) {
    return {
        anticipatePin: 1,
        pinReparent: false,
        invalidateOnRefresh: true,
        ...extra
    };
}

function initStack() {
    const panels = gsap.utils.toArray(".panel");
    if (!panels.length) return;

    gsap.set(panels.slice(1), { yPercent: 100 });

    const stackTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".stack",
            start: "top top",
            end: () => "+=" + (panels.length - 1) * vh(),
            pin: true,
            scrub: true,
            ...pinDefaults()
        }
    });

    panels.slice(1).forEach(panel => {
        stackTl.to(panel, { yPercent: 0, ease: "none", duration: 1 });
    });
}

function initInfrast() {
    const infrastTitle = document.querySelector(".infrast-title");
    const infrastSec = document.querySelector(".infrast-sec");
    const tempEl = document.querySelector(".temp");

    if (!infrastTitle || !infrastSec || !tempEl) return;

    const infraNumber = { value: 0 };

    gsap.set(infrastTitle, { opacity: 0, y: 320 });

    const infraTl = gsap.timeline({
        scrollTrigger: {
            trigger: infrastSec,
            start: "top top",
            end: "+=150%",
            pin: true,
            scrub: true,
            ...pinDefaults({
                onLeaveBack() {
                    gsap.set(infrastTitle, { opacity: 0, y: 320 });
                    infraNumber.value = 0;
                    tempEl.textContent = "0";
                }
            })
        }
    });

    infraTl.to(infrastTitle, { opacity: 1, y: 0, ease: "none", duration: 1 }, 0);
    infraTl.to(infraNumber, {
        value: 50,
        ease: "none",
        duration: 2,
        onUpdate() {
            tempEl.textContent = Math.round(infraNumber.value);
        }
    }, 0.3);
    infraTl.to(infrastTitle, { y: -450, opacity: 0, ease: "none", duration: 1 }, 2.3);
}

function initNorthern() {
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

    const anchorLetter = letters[8];

    function calcOffsets() {
        const targetWord = keepIndexes.map(i => letters[i].textContent).join('');
        const refStyle = window.getComputedStyle(keepLetters[0]);

        const temp = document.createElement('span');
        temp.style.cssText = 'position:fixed;visibility:hidden;left:0;top:0;white-space:nowrap;';
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
            const toLeft = to.left - tempRect.left + targetLeft;

            return {
                x: Math.round(toLeft - from.left),
                y: Math.round(anchorRect.top - from.top)
            };
        });

        document.body.removeChild(temp);
        return offsets;
    }

    ScrollTrigger.matchMedia({
        "(min-width: 768px)": function() {
            const offsets = calcOffsets();

            const tls = gsap.timeline({
                scrollTrigger: {
                    trigger: '.northern-sec',
                    start: 'top top',
                    end: '+=200%',
                    scrub: true,
                    pin: true,
                    ...pinDefaults()
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

        "(max-width: 767px)": function() {
            const tlm = gsap.timeline({
                scrollTrigger: {
                    trigger: '.northern-sec',
                    start: 'top top',
                    end: '+=150%',
                    scrub: true,
                    pin: true,
                    ...pinDefaults()
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

function initDirections() {
    const section = document.querySelector('.directions-sec');
    const pin = document.querySelector('.directions-pin');
    const lineEl = document.querySelector('.directions-line');
    const bottomStage = document.querySelector('.directions-bottom-stage');
    const slides = gsap.utils.toArray('.directions-slide');
    const contents = gsap.utils.toArray('.directions-content');
    const numberEl = document.querySelector('.directions-number');
    const total = slides.length;

    if (!section || !pin || !lineEl || !bottomStage || !total || !numberEl) return;

    section.style.setProperty('--directions-slides', total);
    lineEl.style.setProperty('--directions-slides', total);

    let current = -1;

    function getScrollDistance() {
        return (total - 1) * vh();
    }

    function measureBottomHeight() {
        let maxHeight = 0;

        contents.forEach(content => {
            content.style.position = 'relative';
            content.style.visibility = 'hidden';
            content.style.opacity = '1';
            content.style.pointerEvents = 'none';
            maxHeight = Math.max(maxHeight, content.offsetHeight);
            content.style.position = '';
            content.style.visibility = '';
            content.style.opacity = '';
            content.style.pointerEvents = '';
        });

        bottomStage.style.minHeight = maxHeight + 'px';
    }

    function syncSectionHeight() {
        measureBottomHeight();
        pin.style.height = vh() + 'px';
        section.style.height = (getScrollDistance() + vh()) + 'px';
    }

    function getIndexFromProgress(progress) {
        if (total === 1) return 0;
        const clamped = Math.min(0.9999, Math.max(0, progress));
        return Math.min(total - 1, Math.floor(clamped * total));
    }

    function applySlide(index) {
        if (index === current) return;
        current = index;

        slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
        contents.forEach((content, i) => content.classList.toggle('active', i === index));
        lineEl.style.setProperty('--slide-index', index);
        numberEl.textContent = String(index + 1).padStart(2, '0');
    }

    function syncFromScroll(progress) {
        applySlide(getIndexFromProgress(progress));
    }

    syncSectionHeight();
    applySlide(0);

    ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onUpdate(self) {
            syncFromScroll(self.progress);
        },
        onEnter(self) {
            syncFromScroll(self.progress);
        },
        onEnterBack(self) {
            syncFromScroll(self.progress);
        },
        onLeaveBack() {
            current = -1;
            applySlide(0);
        }
    });
}

function initScale() {
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
        start: 'top 80%',
        once: true,
        invalidateOnRefresh: true,
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
}

function initMistakes() {
    const mistakesTitle = document.querySelector(".mistakes-title");
    const mistakesMain = document.querySelector(".mistakes-main");
    if (!mistakesTitle || !mistakesMain) return;

    gsap.set(mistakesTitle, { opacity: 0, y: 320 });

    const mistakesTl = gsap.timeline({
        scrollTrigger: {
            trigger: mistakesMain,
            start: "top top",
            end: "+=150%",
            pin: true,
            scrub: true,
            ...pinDefaults({
                onLeaveBack() {
                    gsap.set(mistakesTitle, { opacity: 0, y: 320 });
                },
                onEnter(self) {
                    mistakesTl.progress(self.progress);
                },
                onEnterBack(self) {
                    mistakesTl.progress(self.progress);
                }
            })
        }
    });

    mistakesTl.to(mistakesTitle, { opacity: 1, y: 0, ease: "none", duration: 1 }, 0);
    mistakesTl.to(mistakesTitle, { y: -350, opacity: 0, ease: "none", duration: 1 }, 1);
}

async function initScrollSections() {
    initStack();
    initInfrast();

    await document.fonts.ready;
    initNorthern();

    initDirections();
    initScale();
    initMistakes();

    ScrollTrigger.refresh();
}

window.addEventListener('load', initScrollSections);

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const pin = document.querySelector('.directions-pin');
        const section = document.querySelector('.directions-sec');
        const slides = document.querySelectorAll('.directions-slide');
        const total = slides.length;

        if (pin && section && total) {
            pin.style.height = vh() + 'px';
            section.style.height = ((total - 1) * vh() + vh()) + 'px';
        }

        ScrollTrigger.refresh();
    }, 250);
});

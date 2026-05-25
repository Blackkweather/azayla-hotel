/**
 * Azayla Hotel Website Scripts
 * Improved for performance and reliability
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ===== Navbar Scroll Effect =====
    const navbar = document.getElementById('navbar');
    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('solid');
            navbar.classList.remove('transparent');
        } else {
            navbar.classList.remove('solid');
            navbar.classList.add('transparent');
        }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    // ===== Mobile Menu Toggle =====
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', !isExpanded);
            navbar.classList.toggle('open-menu');
        });

        // Close menu when clicking links
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navbar.classList.remove('open-menu');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ===== Room Carousels =====
    document.querySelectorAll('.room-carousel').forEach(carousel => {
        const slides = carousel.querySelectorAll('.carousel-slide');
        const prevBtn = carousel.querySelector('.prev');
        const nextBtn = carousel.querySelector('.next');
        
        if (slides.length <= 1) {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            return;
        }

        let currentIndex = 0;

        const updateSlides = (index) => {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
        };

        const nextSlide = () => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateSlides(currentIndex);
        };

        const prevSlide = () => {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateSlides(currentIndex);
        };

        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);

        // Auto-advance every 5 seconds
        setInterval(nextSlide, 5000);
        
        updateSlides(0);
    });

    // ===== Gallery Lightbox =====
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const galleryImages = document.querySelectorAll('.gallery-image');

    if (lightbox && lightboxImg) {
        galleryImages.forEach(img => {
            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scroll
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

    // ===== Intersection Observer for Fade-in =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => revealObserver.observe(el));

    // ===== Contact Form Handling =====
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            const subject = encodeURIComponent(`Inquiry from ${name}`);
            const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
            
            window.location.href = `mailto:azayla.hotel@gmail.com?subject=${subject}&body=${body}`;
            
            alert('Thank you for your message. Your email client will now open to send the inquiry.');
        });
    }
});
